import * as React from 'react';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Key,
  Lock,
  MapPin,
  QrCode,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { STUDENT_EMAIL_RE } from '@/lib/validation';

export interface StitchCampusHubProps {
  className?: string;
  onEnterApp?: () => void;
}

type SchemaTabKey = 'profiles' | 'delivery_pools' | 'delivery_pool_items' | 'ride_pools' | 'gear_listings';

interface SchemaDefinition {
  name: string;
  pk: string;
  fields: { col: string; type: string }[];
  rls: string;
}

const SCHEMAS: Record<SchemaTabKey, SchemaDefinition> = {
  profiles: {
    name: 'public.profiles',
    pk: 'PRIMARY KEY (id)',
    fields: [
      { col: 'id', type: 'uuid REFERENCES auth.users NOT NULL' },
      { col: 'email', type: "text CHECK (email ~* '^btech15\\\\d{3}\\\\.\\\\d{2}@bitmesra\\\\.ac\\\\.in$')" },
      { col: 'full_name', type: 'text NOT NULL' },
      { col: 'hostel', type: "text CHECK (hostel IN ('BH1','BH2','BH3','GH'))" },
      { col: 'wing', type: "text DEFAULT 'A'" },
      { col: 'room', type: 'text NOT NULL' },
      { col: 'upi_id', type: 'text NOT NULL' },
      { col: 'created_at', type: 'timestamptz DEFAULT now()' },
    ],
    rls: 'create policy "Student self-update" on profiles for update using (auth.uid() = id);',
  },
  delivery_pools: {
    name: 'public.delivery_pools',
    pk: 'PRIMARY KEY (id)',
    fields: [
      { col: 'id', type: 'uuid DEFAULT gen_random_uuid()' },
      { col: 'host_id', type: 'uuid REFERENCES profiles(id)' },
      { col: 'hostel', type: "text NOT NULL -- e.g. 'BH2'" },
      { col: 'platform', type: "text CHECK (platform IN ('Blinkit','Zepto','Instamart'))" },
      { col: 'threshold', type: 'numeric(10,2) DEFAULT 149.00' },
      { col: 'delivery_fee', type: 'numeric(10,2) DEFAULT 35.00' },
      { col: 'small_order_fee', type: 'numeric(10,2) DEFAULT 20.00' },
      { col: 'handling_fee', type: 'numeric(10,2) DEFAULT 4.00' },
      { col: 'current_total', type: 'numeric(10,2) DEFAULT 0.00' },
      { col: 'status', type: "text CHECK (status IN ('open','locked','ordered','settled'))" },
      { col: 'expires_at', type: 'timestamptz NOT NULL' },
    ],
    rls: 'create policy "Hostel-mates can view active pools" on delivery_pools for select using (true);',
  },
  delivery_pool_items: {
    name: 'public.delivery_pool_items',
    pk: 'PRIMARY KEY (id)',
    fields: [
      { col: 'id', type: 'uuid DEFAULT gen_random_uuid()' },
      { col: 'pool_id', type: 'uuid REFERENCES delivery_pools(id) ON DELETE CASCADE' },
      { col: 'user_id', type: 'uuid REFERENCES profiles(id)' },
      { col: 'item_name', type: 'text NOT NULL' },
      { col: 'price', type: 'numeric(10,2) NOT NULL' },
      { col: 'qty', type: 'integer DEFAULT 1' },
      { col: 'paid', type: 'boolean DEFAULT false' },
    ],
    rls: 'create policy "Users manage own pool items" on delivery_pool_items for all using (auth.uid() = user_id);',
  },
  ride_pools: {
    name: 'public.ride_pools & hubs',
    pk: 'PRIMARY KEY (id)',
    fields: [
      { col: 'id', type: 'uuid DEFAULT gen_random_uuid()' },
      { col: 'host_id', type: 'uuid REFERENCES profiles(id)' },
      { col: 'hub_destination', type: "text CHECK (hub_destination IN ('Patna Jn','Danapur','Airport','Eco Park'))" },
      { col: 'departure_start', type: 'timestamptz NOT NULL' },
      { col: 'departure_end', type: 'timestamptz NOT NULL' },
      { col: 'max_seats', type: 'smallint DEFAULT 4' },
      { col: 'booked_seats', type: 'smallint DEFAULT 1' },
      { col: 'meeting_point', type: "text DEFAULT 'Main Gate 1 Security Booth'" },
      { col: 'chat_active', type: 'boolean DEFAULT true' },
    ],
    rls: 'create policy "Commuters insert ride joins" on ride_pools for update using (booked_seats < max_seats);',
  },
  gear_listings: {
    name: 'public.gear_listings',
    pk: 'PRIMARY KEY (id)',
    fields: [
      { col: 'id', type: 'uuid DEFAULT gen_random_uuid()' },
      { col: 'seller_id', type: 'uuid REFERENCES profiles(id)' },
      { col: 'title', type: 'text NOT NULL' },
      { col: 'category', type: "text CHECK (category IN ('Lab Gear','Books','ED Drafters','Electronics'))" },
      { col: 'price', type: 'numeric(10,2) CHECK (price <= 400.00) -- Strict Fair Price Cap' },
      { col: 'condition', type: "text CHECK (condition IN ('Like New','Good','Functional'))" },
      { col: 'handoff_window', type: 'text NOT NULL' },
      { col: 'claimed', type: 'boolean DEFAULT false' },
    ],
    rls: 'create policy "Verified campus peers can claim" on gear_listings for update using (claimed = false);',
  },
};

export function StitchCampusHub({ className, onEnterApp }: StitchCampusHubProps) {
  // Demo Personas
  const [activePersona, setActivePersona] = React.useState<'student1' | 'student2'>('student1');

  // Form State
  const [email, setEmail] = React.useState('btech15042.22@bitmesra.ac.in');
  const [fullName, setFullName] = React.useState('Aman Raj');
  const [hostel, setHostel] = React.useState('BH2');
  const [room, setRoom] = React.useState('214');
  const [upiId, setUpiId] = React.useState('amanraj@okhdfcbank');
  const [accessMethod, setAccessMethod] = React.useState<'magic' | 'otp'>('magic');

  // UI state
  const [showQR, setShowQR] = React.useState(false);
  const [activeSchemaTab, setActiveSchemaTab] = React.useState<SchemaTabKey>('profiles');
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // Seed sandbox state
  const [poolCurrent, setPoolCurrent] = React.useState(69);
  const [poolTarget] = React.useState(149);
  const [rideSeatsLocked, setRideSeatsLocked] = React.useState(2);
  const [, setGearClaimed] = React.useState(false);

  const isEmailValid = STUDENT_EMAIL_RE.test(email.trim());

  const handlePersonaSwitch = (p: 'student1' | 'student2') => {
    setActivePersona(p);
    if (p === 'student1') {
      setEmail('btech15042.22@bitmesra.ac.in');
      setFullName('Aman Raj');
      setHostel('BH2');
      setRoom('214');
      setUpiId('amanraj@okhdfcbank');
    } else {
      setEmail('btech15108.23@bitmesra.ac.in');
      setFullName('Riya Kumari');
      setHostel('GH');
      setRoom('108');
      setUpiId('riya.k@icici');
    }
    toast.success(`Switched active demo persona to ${p === 'student1' ? 'Aman Raj (BH2)' : 'Riya Kumari (GH)'}`);
  };

  const handleSaveProfile = () => {
    if (!isEmailValid) {
      toast.error('Please enter a valid BIT Patna roll email format (e.g. btech15042.22@bitmesra.ac.in)');
      return;
    }
    setSaveSuccess(true);
    toast.success('✓ Student Profile Verified and Synced with BIT Patna Cache');
    setTimeout(() => {
      setSaveSuccess(false);
      if (onEnterApp) onEnterApp();
    }, 1800);
  };

  const handleTriggerSeed = () => {
    setPoolCurrent((prev) => (prev >= 112 ? 69 : 112));
    setRideSeatsLocked((prev) => (prev >= 3 ? 2 : 3));
    toast.success('🌱 Seeded: BH2 Blinkit pool updated, Patna Jn Auto synced, Drafter staged.');
  };

  const handleResetSandbox = () => {
    setPoolCurrent(69);
    setRideSeatsLocked(2);
    setGearClaimed(false);
    handlePersonaSwitch('student1');
    toast.info('⚡ Sandbox state reset to standard BIT Patna morning baseline.');
  };

  const activeSchema = SCHEMAS[activeSchemaTab];

  return (
    <div className={cn('w-full font-sans text-slate-900', className)}>
      {/* 1. Top Utility Context / Verification Strip */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <span className="text-[13px] font-bold text-slate-900">
            BIT Patna Intranet Protocol
          </span>
          <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wide text-slate-600">
            Official BIT Patna Domain: @bitmesra.ac.in
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-slate-600">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
          </span>
          <span>Postgres CDC Engine Live</span>
        </div>
      </div>

      {/* 2. Hero & Welcome Section */}
      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              <Zap className="h-3.5 w-3.5 text-emerald-600" />
              Hyper-Local Logistics Engine
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              Welcome to <span className="text-slate-900">Fare</span><span className="text-emerald-700">Buddy</span>
            </h1>
            <p className="mt-2.5 text-[14px] leading-relaxed text-slate-600 sm:text-[15px]">
              The hyper-local micro-pooling network for BIT Patna hostellers. Zero small-order surcharges, shared auto commutes, and peer-to-peer campus gear resale.
            </p>
          </div>

          {/* Quick Persona Switcher Chip Group */}
          <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 lg:min-w-[300px]">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Active Persona
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-700">
                1-Click Live Switch
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handlePersonaSwitch('student1')}
                className={cn(
                  'flex flex-col rounded-xl p-2.5 text-left transition-all',
                  activePersona === 'student1'
                    ? 'border border-emerald-500/30 bg-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-100/80 opacity-70 hover:opacity-100',
                )}
              >
                <span className="truncate text-[13px] font-bold text-slate-900">Aman Raj</span>
                <span className="truncate font-mono text-[11px] font-semibold text-emerald-700">btech15042.22</span>
                <span className="mt-0.5 text-[10px] font-semibold text-slate-500">BH2 • Room 214</span>
              </button>

              <button
                type="button"
                onClick={() => handlePersonaSwitch('student2')}
                className={cn(
                  'flex flex-col rounded-xl p-2.5 text-left transition-all',
                  activePersona === 'student2'
                    ? 'border border-emerald-500/30 bg-white shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-slate-100/80 opacity-70 hover:opacity-100',
                )}
              >
                <span className="truncate text-[13px] font-bold text-slate-900">Riya Kumari</span>
                <span className="truncate font-mono text-[11px] font-semibold text-emerald-700">btech15108.23</span>
                <span className="mt-0.5 text-[10px] font-semibold text-slate-500">GH • Room 108</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Primary Split Grid: Auth Flow (Left) vs DB Realtime Architecture (Right) */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Auth & Student ID Onboarding Flow */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          {/* Step 1: Institutional Validation Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-700 font-mono text-[13px] font-bold text-white">
                  1
                </span>
                <h2 className="text-[17px] font-extrabold text-slate-900">
                  Institutional Auth Gate
                </h2>
              </div>
              <span className="rounded-full bg-emerald-100/80 px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-emerald-800">
                Regex Enforced
              </span>
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-slate-600">
              Authentication is verified strictly through your BIT Mesra / BIT Patna GSuite institutional credentials.
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-900" htmlFor="roll-email-input">
                  BIT Patna Roll Email
                </label>
                <div className="relative">
                  <input
                    id="roll-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="btech15xxx.xx@bitmesra.ac.in"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 pr-10 font-mono text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none"
                  />
                  <span className="absolute right-3.5 top-3">
                    {isEmailValid ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-1 text-[11px]">
                  <span className="font-mono text-slate-500">
                    Pattern: ^btech15\d&#123;3&#125;\.\d&#123;2&#125;@bitmesra\.ac\.in$
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 font-mono font-bold',
                      isEmailValid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700',
                    )}
                  >
                    {isEmailValid ? 'Valid Roll Pattern' : 'Invalid Format'}
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-900">
                  Access Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAccessMethod('magic')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-[13px] font-bold transition-all',
                      accessMethod === 'magic'
                        ? 'border border-emerald-600/30 bg-emerald-50 text-emerald-900'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                    )}
                  >
                    <Key className="h-4 w-4 text-emerald-600" /> Magic Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccessMethod('otp')}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-[13px] font-bold transition-all',
                      accessMethod === 'otp'
                        ? 'border border-emerald-600/30 bg-emerald-50 text-emerald-900'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                    )}
                  >
                    <Lock className="h-4 w-4 text-emerald-600" /> Password OTP
                  </button>
                </div>
              </div>

              {/* Security info callout */}
              <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50 p-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div className="text-[12px] leading-relaxed text-slate-600">
                  <strong className="text-slate-900">Supabase Auth RLS + Postgres Trigger:</strong> Direct write validation blocks unregistered student domain pools directly on the database level.
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Student Profile Onboarding Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-600 font-mono text-[13px] font-bold text-white">
                  2
                </span>
                <h2 className="text-[17px] font-extrabold text-slate-900">
                  Student Profile &amp; Hub Setup
                </h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">
                Step 2 of 2
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-slate-900">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-[14px] text-slate-900 transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-900">
                    Hostel Block
                  </label>
                  <select
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none"
                  >
                    <option value="BH1">BH1 (Aryabhatta Hostel)</option>
                    <option value="BH2">BH2 (Bhabha Hostel)</option>
                    <option value="BH3">BH3 (Ramanujan Hostel)</option>
                    <option value="GH">GH (Girls Hostel)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-slate-900">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 font-mono text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[13px] font-bold text-slate-900">
                    Instant Split UPI ID
                  </label>
                  <span className="flex items-center gap-1 font-mono text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Verified Bank Handle
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 font-mono text-[13px] text-slate-900 transition-colors focus:border-emerald-600 focus:bg-white focus:outline-none"
                    />
                    <span className="absolute right-3 top-2.5 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white">
                      UPI
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQR((v) => !v)}
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-[12px] font-bold text-slate-800 transition-colors hover:bg-slate-200"
                  >
                    <QrCode className="h-4 w-4" /> Preview QR
                  </button>
                </div>
              </div>

              {/* QR Modal Preview Mock */}
              {showQR && (
                <div className="animate-fade-up rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                        <QrCode className="h-9 w-9 text-slate-800" />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900">{fullName}</p>
                        <p className="font-mono text-[11px] text-slate-500">{upiId}</p>
                        <p className="text-[10px] font-semibold text-emerald-700">Pre-synced for instant 4-way cart settlements</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQR(false)}
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveProfile}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 px-4 font-bold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-[0.99]"
              >
                <span>Save Profile &amp; Enter Campus Hub</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {saveSuccess && (
                <div className="animate-fade-up rounded-xl bg-emerald-100 p-2.5 text-center font-bold text-emerald-900 text-[13px]">
                  ✓ Student Profile Verified and Synced with BIT Patna Cache
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Database Schema & Realtime Architecture */}
        <div className="flex flex-col gap-6 lg:col-span-6">
          <div className="flex h-full flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div>
              {/* Architecture Header */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-[17px] font-extrabold text-slate-900">
                    Supabase &amp; Postgres Schema
                  </h2>
                  <p className="text-[12px] text-slate-500">
                    Production-ready Relational DDL for BIT Patna Pool Engine
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                    RLS Active
                  </span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-800">
                    CDC PubSub
                  </span>
                </div>
              </div>

              {/* Schema Tabs */}
              <div className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto pb-1">
                {(Object.keys(SCHEMAS) as SchemaTabKey[]).map((key) => {
                  const isActive = activeSchemaTab === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveSchemaTab(key)}
                      className={cn(
                        'whitespace-nowrap rounded-lg px-2.5 py-1 text-[12px] font-bold transition-colors',
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                      )}
                    >
                      {key}
                    </button>
                  );
                })}
              </div>

              {/* DDL Schema View */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[13px] font-bold text-emerald-700">
                    {activeSchema.name}
                  </span>
                  <span className="rounded bg-slate-200/80 px-2 py-0.5 font-mono text-[10.5px] text-slate-600">
                    {activeSchema.pk}
                  </span>
                </div>

                <div className="max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 font-mono text-[12px] text-slate-800 space-y-1">
                  {activeSchema.fields.map((field, idx) => (
                    <div key={idx} className="flex gap-1.5">
                      <span className="font-bold text-blue-700">{field.col}</span>:
                      <span className="text-slate-600">{field.type}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-lg border border-slate-200/70 bg-white p-2.5 text-[11.5px] text-slate-700">
                  🛡️ <strong>RLS Policy:</strong>{' '}
                  <span className="font-mono text-emerald-800">{activeSchema.rls}</span>
                </div>
              </div>

              {/* Realtime Postgres Channel Visualizer */}
              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-900">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Realtime Supabase Broadcast
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-700">
                    channel: 'campus:{hostel.toLowerCase()}:pool'
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  Auto-dispatches socket payloads to all students in the same hostel block on cart or ride updates.
                </p>
              </div>
            </div>

            {/* Commute Corridor Preview */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-[12px] font-bold text-slate-900">
                  BIT Patna Commute Corridor
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Bariatu / Samanpura Link
                </span>
              </div>
              <div className="relative flex h-24 items-end overflow-hidden rounded-xl border border-slate-200 bg-slate-900/90 p-2.5 text-white">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{
                    backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKCbfHcK-e7sF9fkfL1_nMXSzxr7l92-2qNTTux6ooiFU9fTAnYV48vazF1j5SpwUPDOZbcDiAUCox2Fwl31gna8OZxv-a2Vjlue-SCcsVRxUHOk09gk4rYFOup03xdGreF_ICQaLbQeATzXKmvsB23qEIFjH0iPHcvb6IdHHI3YtjVsJbSdSACw8pWBoE4dJITHb56-E02jk9nHG_i1CKa9gDKooNO6s890L0aFk')`,
                  }}
                />
                <div className="relative z-10 flex items-center gap-1.5 rounded-lg bg-white/90 px-2 py-1 text-[11.5px] font-bold text-slate-900 backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5 text-emerald-700" />
                  BIT Patna to Patna Junction (11.4 km corridor)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Judge & Demo Tools Drawer / Console (Seed Data Center) */}
      <div className="mb-6 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              <h3 className="text-[18px] font-extrabold text-slate-900">
                BIT Patna Demo Seed Center &amp; Sandbox
              </h3>
            </div>
            <p className="mt-0.5 text-[13px] text-slate-600">
              Mock state generator tailored for hackathon evaluation: trigger live pools, simulated orders, and persona interchanges.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerSeed}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-[12px] font-bold text-white shadow-sm transition-all hover:bg-emerald-800"
            >
              <Sparkles className="h-3.5 w-3.5" /> 🌱 Seed Demo Data
            </button>
            <button
              type="button"
              onClick={() => handlePersonaSwitch(activePersona === 'student1' ? 'student2' : 'student1')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-[12px] font-bold text-slate-800 transition-all hover:bg-slate-200"
            >
              <Users className="h-3.5 w-3.5" /> 👥 Switch Persona
            </button>
            <button
              type="button"
              onClick={handleResetSandbox}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-[12px] font-bold text-slate-600 transition-all hover:bg-slate-100"
            >
              <RotateCcw className="h-3.5 w-3.5" /> ⚡ Reset State
            </button>
          </div>
        </div>

        {/* Live Seed Status Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Seed Tile 1: Delivery Pool */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-slate-300">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase text-amber-900">
                Blinkit Pool
              </span>
              <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-700">
                <Clock className="h-3 w-3" /> 07:42 left
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-slate-900">
              BH2 Ground &amp; 1st Floor Snacks
            </h4>
            <p className="mb-3 text-[11.5px] text-slate-500">
              Threshold: ₹149 for free delivery (avoids ₹35 fee)
            </p>

            <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${Math.min(100, (poolCurrent / poolTarget) * 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between font-mono text-[12px]">
              <span className="font-bold text-emerald-800">
                ₹{poolCurrent} / ₹{poolTarget} pooled
              </span>
              <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[10px] text-slate-700">
                ₹{Math.max(0, poolTarget - poolCurrent)} needed
              </span>
            </div>
          </div>

          {/* Seed Tile 2: Auto Commute Pool */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-slate-300">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase text-blue-900">
                Shared Auto
              </span>
              <span className="font-mono text-[11px] font-semibold text-blue-700">
                17:15 Departs
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-slate-900">
              Campus Gate 1 → Patna Jn
            </h4>
            <p className="mb-3 text-[11.5px] text-slate-500">
              Catching Vande Bharat / Rajdhani express
            </p>

            <div className="mb-2 flex items-center gap-3">
              <span className="flex items-center gap-1 rounded bg-white px-2 py-1 shadow-xs font-mono text-[12px]">
                {[1, 2, 3, 4].map((seat) => (
                  <span
                    key={seat}
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      seat <= rideSeatsLocked ? 'bg-emerald-600' : 'border border-slate-300 bg-slate-100',
                    )}
                  />
                ))}
              </span>
              <span className="font-mono text-[13px] font-extrabold text-emerald-800">
                ₹40 / seat
              </span>
            </div>

            <div className="flex items-center justify-between text-[11.5px]">
              <span className="font-bold text-slate-800">
                {rideSeatsLocked} / 4 seats locked
              </span>
              <span className="rounded bg-slate-200/80 px-2 py-0.5 font-mono text-[10px] text-slate-600">
                Shared with {fullName.split(' ')[0]}
              </span>
            </div>
          </div>

          {/* Seed Tile 3: Gear Resale */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:border-slate-300">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase text-emerald-900">
                Lab Gear
              </span>
              <span className="font-mono text-[11px] font-bold text-emerald-700">
                Capped ≤ ₹400
              </span>
            </div>
            <h4 className="text-[14px] font-bold text-slate-900">
              Omega Engineering Mini-Drafter
            </h4>
            <p className="mb-3 text-[11.5px] text-slate-500">
              1st Year Workshop / ED drawing standard
            </p>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="font-mono text-[15px] font-extrabold text-emerald-800">
                  ₹250
                </span>
                <span className="ml-1.5 font-mono text-[12px] text-slate-400 line-through">
                  ₹650 MRP
                </span>
              </div>
              <span className="rounded bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 shadow-xs border border-slate-200/60">
                BH2 Lobby
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Persona Metadata Quick Info Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-slate-50 p-4 sm:p-5">
        <div className="flex items-center gap-3.5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-700 text-lg font-black text-white shadow-sm">
            {fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold text-slate-900">
                {fullName} ({activePersona === 'student1' ? 'Student 1' : 'Student 2'})
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-emerald-800">
                {activePersona === 'student1' ? 'Host & Organizer' : 'Joiner & Contributor'}
              </span>
            </div>
            <p className="text-[12px] text-slate-600">
              {email} • {activePersona === 'student1' ? 'Computer Science' : 'Electronics & Comm.'} • {hostel} Room {room}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono">
          <span className="text-[12px] font-medium text-slate-500">Campus Wallet:</span>
          <span className="text-[16px] font-extrabold text-emerald-800">
            {activePersona === 'student1' ? '₹420.50' : '₹185.00'}
          </span>
        </div>
      </div>
    </div>
  );
}
