import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  CarTaxiFront,
  ClipboardList,
  DraftingCompass,
  Phone,
  ShoppingCart,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/empty-state';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import {
  loadRequests,
  subscribeRequests,
  type GearRequest,
  type PoolRequest,
  type RequestContact,
} from '@/lib/requests';

function ContactPhone({ contact }: { contact: RequestContact }) {
  if (!contact.phone) {
    return <span className="text-[11px] font-semibold text-slate-400">Phone not added</span>;
  }
  return (
    <a
      href={`tel:+91${contact.phone}`}
      className="inline-flex items-center gap-1 rounded-full bg-emerald-700 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-emerald-800"
    >
      <Phone className="h-3 w-3" />
      +91 {contact.phone}
    </a>
  );
}

function ContactLine({ contact }: { contact: RequestContact }) {
  return (
    <p className="text-[11.5px] text-slate-600">
      {contact.hostel ?? 'BIT Patna'}
      {contact.room ? ` · Room ${contact.room}` : ''}
    </p>
  );
}

function YourGearCard({ item }: { item: GearRequest }) {
  return (
    <div className="stitch-card bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="tag-hostel">{item.tag}</span>
          <h3 className="mt-2 text-[15px] font-black leading-snug text-slate-900">{item.title}</h3>
          <p className="mt-1 font-mono text-[12.5px] font-bold text-emerald-800">
            ₹{item.price}{' '}
            <span className="font-semibold text-slate-400 line-through">₹{item.originalPrice}</span>
          </p>
        </div>
        <Badge variant={item.status === 'claimed' ? 'success' : 'muted'}>
          {item.status === 'claimed' ? 'Claimed' : 'Live'}
        </Badge>
      </div>

      {item.claimedBy ? (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-emerald-800">
            Claimed by
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[13px] font-extrabold text-slate-900">{item.claimedBy.name}</p>
              <ContactLine contact={item.claimedBy} />
            </div>
            <ContactPhone contact={item.claimedBy} />
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[11.5px] text-slate-500">
          Waiting for a claim — live on the Gear Bazaar feed.
        </p>
      )}
    </div>
  );
}

function YourPoolCard({ pool }: { pool: PoolRequest }) {
  const Icon = pool.kind === 'cart' ? ShoppingCart : CarTaxiFront;
  return (
    <div className="stitch-card bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="tag-hostel inline-flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {pool.kind === 'cart' ? 'Cart pool' : 'Ride pool'}
          </span>
          <h3 className="mt-2 text-[15px] font-black leading-snug text-slate-900">
            {pool.poolLabel}
          </h3>
          <p className="mt-1 text-[11.5px] text-slate-500">{pool.detail}</p>
        </div>
        <Badge variant={pool.members.length ? 'success' : 'muted'}>
          {pool.members.length} joined
        </Badge>
      </div>

      {pool.members.length ? (
        <div className="mt-3 space-y-1.5">
          {pool.members.map((member) => (
            <div
              key={member.userId}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2"
            >
              <div>
                <p className="text-[12.5px] font-bold text-slate-900">{member.name}</p>
                <ContactLine contact={member} />
              </div>
              <ContactPhone contact={member} />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[11.5px] text-slate-500">
          No one has joined yet — share the pool with your floor.
        </p>
      )}
    </div>
  );
}

function ClaimedGearCard({ item }: { item: GearRequest }) {
  return (
    <div className="stitch-card bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="tag-hostel">{item.tag}</span>
          <h3 className="mt-2 text-[15px] font-black leading-snug text-slate-900">{item.title}</h3>
          <p className="mt-1 font-mono text-[12.5px] font-bold text-emerald-800">₹{item.price}</p>
        </div>
        <Badge variant="success">Claimed</Badge>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
          Seller · handoff contact
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[13px] font-extrabold text-slate-900">{item.seller.name}</p>
            <ContactLine contact={item.seller} />
          </div>
          <ContactPhone contact={item.seller} />
        </div>
      </div>
    </div>
  );
}

function ClaimedPoolCard({ pool }: { pool: PoolRequest }) {
  const Icon = pool.kind === 'cart' ? ShoppingCart : CarTaxiFront;
  return (
    <div className="stitch-card bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="tag-hostel inline-flex items-center gap-1">
            <Icon className="h-3 w-3" />
            {pool.kind === 'cart' ? 'Cart pool' : 'Ride pool'}
          </span>
          <h3 className="mt-2 text-[15px] font-black leading-snug text-slate-900">
            {pool.poolLabel}
          </h3>
          <p className="mt-1 text-[11.5px] text-slate-500">{pool.detail}</p>
        </div>
        <Badge variant="success">Joined</Badge>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-slate-500">
          Host contact
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[13px] font-extrabold text-slate-900">{pool.host.name}</p>
            <ContactLine contact={pool.host} />
          </div>
          <ContactPhone contact={pool.host} />
        </div>
      </div>
    </div>
  );
}

export function RequestsPage() {
  const { profile } = useAuth();
  const [records, setRecords] = React.useState(() => loadRequests());

  React.useEffect(() => subscribeRequests(() => setRecords(loadRequests())), []);

  const myId = profile?.id;
  const gearRequests = records.filter((record): record is GearRequest => record.kind === 'gear');
  const poolRequests = records.filter((record): record is PoolRequest => record.kind !== 'gear');

  const yourRecords = records.filter((record) =>
    record.kind === 'gear' ? record.seller.userId === myId : record.host.userId === myId,
  );
  const claimedRecords = records.filter((record) =>
    record.kind === 'gear'
      ? record.claimedBy?.userId === myId
      : record.members.some((member) => member.userId === myId),
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Your account"
        title="Requests"
        description="Everything you listed or claimed, with live status and campus contact numbers."
      />

      <Tabs defaultValue="yours">
        <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
          <TabsTrigger value="yours">
            <ClipboardList className="h-3.5 w-3.5" />
            Your requests
            <Badge variant="muted" className="ml-1">
              {yourRecords.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="claimed">
            <DraftingCompass className="h-3.5 w-3.5" />
            Claimed requests
            <Badge variant="muted" className="ml-1">
              {claimedRecords.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="yours">
          {yourRecords.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-6 w-6" />}
              title="Nothing listed yet"
              description="List gear from the Gear Bazaar, or host a pool — claims and joiners will appear here with their contact numbers."
              action={
                <Button asChild size="sm">
                  <Link to="/gear">List an item</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {yourRecords.map((record) =>
                record.kind === 'gear' ? (
                  <YourGearCard key={record.id} item={record} />
                ) : (
                  <YourPoolCard key={record.id} pool={record} />
                ),
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claimed">
          {claimedRecords.length === 0 ? (
            <EmptyState
              icon={<DraftingCompass className="h-6 w-6" />}
              title="No claims yet"
              description="Claim a gear request or join a pool to see the host’s number here."
              action={
                <Button asChild size="sm">
                  <Link to="/gear">Browse gear</Link>
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {claimedRecords.map((record) =>
                record.kind === 'gear' ? (
                  <ClaimedGearCard key={record.id} item={record} />
                ) : (
                  <ClaimedPoolCard key={record.id} pool={record} />
                ),
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {gearRequests.length} gear listings and {poolRequests.length} pool requests are live on this
        device. Numbers come from each student’s onboarding profile.
      </p>
    </div>
  );
}
