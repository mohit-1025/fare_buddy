import * as React from 'react';
import {
  ArrowRight,
  Clock,
  Plus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RidePool {
  id: string;
  destination: string;
  distance: string;
  meetingPoint: string;
  departureTime: string;
  farePerSeat: number;
  totalSeats: number;
  bookedSeats: number;
  hostName: string;
  hostHostel: string;
  note: string;
}

export function RidePoolPage() {
  const [rides, setRides] = React.useState<RidePool[]>([
    {
      id: '1',
      destination: 'Patna Junction (PNBE)',
      distance: '11.4 km corridor',
      meetingPoint: 'Main Gate 1 Security Booth',
      departureTime: '17:15',
      farePerSeat: 40,
      totalSeats: 4,
      bookedSeats: 2,
      hostName: 'Aman Raj',
      hostHostel: 'BH2',
      note: 'Catching Vande Bharat / Rajdhani Express',
    },
    {
      id: '2',
      destination: 'Danapur Railway Station (DNR)',
      distance: '14.0 km corridor',
      meetingPoint: 'ICICI Gate',
      departureTime: '18:00',
      farePerSeat: 50,
      totalSeats: 4,
      bookedSeats: 3,
      hostName: 'Riya Kumari',
      hostHostel: 'GH',
      note: 'Evening Intercity Express departure',
    },
    {
      id: '3',
      destination: 'Jay Prakash Narayan Airport (PAT)',
      distance: '16.5 km corridor',
      meetingPoint: 'Main Gate 1',
      departureTime: '19:30',
      farePerSeat: 95,
      totalSeats: 4,
      bookedSeats: 1,
      hostName: 'Kunal Singh',
      hostHostel: 'BH1',
      note: 'Terminal 1 check-in before 21:00',
    },
  ]);

  const handleJoinRide = (id: string) => {
    setRides((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          if (r.bookedSeats >= r.totalSeats) {
            toast.error('This ride pool is already full');
            return r;
          }
          toast.success(`Joined ride to ${r.destination}! Seat reserved for ₹${r.farePerSeat}.`);
          return { ...r, bookedSeats: r.bookedSeats + 1 };
        }
        return r;
      }),
    );
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Module 02 · Ride Pool"
        title="Ride Pool"
        description="Share auto-rickshaws and cabs between campus hostels, railway stations, and local transit hubs."
        actions={
          <div className="flex items-center gap-2">
            <span className="tag-hostel">Campus Gate 1</span>
            <Badge variant="success" className="font-mono text-[11px]">
              Live GPS Corridors
            </Badge>
          </div>
        }
      />

      {/* Commute Corridor Visual Banner */}
      <div className="stitch-card relative overflow-hidden bg-slate-900 text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKCbfHcK-e7sF9fkfL1_nMXSzxr7l92-2qNTTux6ooiFU9fTAnYV48vazF1j5SpwUPDOZbcDiAUCox2Fwl31gna8OZxv-a2Vjlue-SCcsVRxUHOk09gk4rYFOup03xdGreF_ICQaLbQeATzXKmvsB23qEIFjH0iPHcvb6IdHHI3YtjVsJbSdSACw8pWBoE4dJITHb56-E02jk9nHG_i1CKa9gDKooNO6s890L0aFk')`,
          }}
        />
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 font-mono text-[11px] font-bold uppercase text-emerald-300">
              BIT Patna Commute Corridor
            </span>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">
              Birla Institute of Technology → Patna Jn &amp; Airport Hubs
            </h2>
            <p className="mt-1 text-[13px] text-slate-300">
              Average solo auto fare: <span className="line-through text-slate-400">₹160–₹350</span>. With FareBuddy 4-seat pool: <span className="font-bold text-emerald-400">₹40–₹95 each</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.info('New ride pool creation drawer opened')}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Offer / Host a Ride
          </button>
        </div>
      </div>

      {/* Ride Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {rides.map((ride) => {
          const isFull = ride.bookedSeats >= ride.totalSeats;
          return (
            <div key={ride.id} className="stitch-card flex flex-col justify-between bg-white">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="tag-hostel">{ride.meetingPoint}</span>
                  <span className="tag-timer">
                    <Clock className="h-3 w-3" /> {ride.departureTime} Departs
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-black text-slate-900">
                  {ride.destination}
                </h3>
                <p className="text-[12px] text-slate-500">{ride.distance} • {ride.note}</p>

                {/* Capacity Dots */}
                <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: ride.totalSeats }).map((_, idx) => (
                      <span
                        key={idx}
                        className={cn(
                          'h-3.5 w-3.5 rounded-full transition-colors',
                          idx < ride.bookedSeats
                            ? 'bg-emerald-600 shadow-xs'
                            : 'border-2 border-slate-300 bg-white',
                        )}
                      />
                    ))}
                    <span className="ml-1.5 font-mono text-[12px] font-bold text-slate-700">
                      {ride.bookedSeats}/{ride.totalSeats} seats
                    </span>
                  </div>

                  <span className="font-mono text-[16px] font-extrabold text-emerald-800">
                    ₹{ride.farePerSeat} <span className="text-[11px] font-semibold text-slate-500">/ seat</span>
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-600">
                  <Users className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    Host: <strong className="text-slate-900">{ride.hostName}</strong> ({ride.hostHostel})
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleJoinRide(ride.id)}
                disabled={isFull}
                className={cn(
                  'mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-bold transition-all',
                  isFull
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 active:scale-[0.99]',
                )}
              >
                {isFull ? (
                  'Ride Pool Full'
                ) : (
                  <>
                    <span>Join Pool (₹{ride.farePerSeat})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
