import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock,
  Plus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import { addNotification } from '@/lib/notifications';
import { contactFromProfile, recordPoolHost, recordPoolJoin } from '@/lib/requests';
import {
  AIRPORTS,
  MEETING_POINTS,
  OTHER_DESTINATION,
  RAILWAY_STATIONS,
  createRide,
  isDepartureTimeInPast,
  isRideDeparted,
  joinRide,
  loadRides,
  subscribeRides,
  type RidePool,
} from '@/lib/rides';
import { cn } from '@/lib/utils';

const SEAT_OPTIONS = ['2', '3', '4', '5', '6'] as const;

type FormErrors = Partial<
  Record<'destination' | 'totalFare' | 'meetingPoint' | 'departureTime', string>
>;

export function RidePoolPage() {
  const { profile } = useAuth();
  const [rides, setRides] = React.useState<RidePool[]>(() => loadRides());
  const [hostOpen, setHostOpen] = React.useState(false);
  const [destinationChoice, setDestinationChoice] = React.useState<string>(RAILWAY_STATIONS[0].value);
  const [customDestination, setCustomDestination] = React.useState('');
  const [totalFare, setTotalFare] = React.useState('');
  const [seats, setSeats] = React.useState<string>('4');
  const [meetingPoint, setMeetingPoint] = React.useState<string>(MEETING_POINTS[0]);
  const [departureTime, setDepartureTime] = React.useState('');
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [now, setNow] = React.useState(() => Date.now());

  React.useEffect(() => subscribeRides(() => setRides(loadRides())), []);

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const myId = profile?.id;
  const activeRides = rides.filter((ride) => !isRideDeparted(ride, now));
  const openRides = activeRides.filter(
    (ride) =>
      ride.members.length < ride.totalSeats &&
      ride.hostId !== myId &&
      !ride.members.some((member) => member.userId === myId),
  );
  const hiddenRideCount = activeRides.filter(
    (ride) => ride.hostId === myId || ride.members.some((member) => member.userId === myId),
  ).length;

  const resetHostForm = () => {
    setDestinationChoice(RAILWAY_STATIONS[0].value);
    setCustomDestination('');
    setTotalFare('');
    setSeats('4');
    setMeetingPoint(MEETING_POINTS[0]);
    setDepartureTime('');
    setErrors({});
  };

  const farePreview = (() => {
    const fare = Number(totalFare);
    const seatCount = Number(seats);
    if (!Number.isFinite(fare) || fare <= 0 || !seatCount) return null;
    return Math.ceil(fare / seatCount);
  })();

  const handleHostRide = (event: React.FormEvent) => {
    event.preventDefault();
    if (!profile) return;

    const nextErrors: FormErrors = {};
    const fare = Number(totalFare);
    const destination =
      destinationChoice === OTHER_DESTINATION ? customDestination.trim() : destinationChoice;
    const knownDestination = [...RAILWAY_STATIONS, ...AIRPORTS].find(
      (option) => option.value === destinationChoice,
    );

    if (!destination) nextErrors.destination = 'Enter the destination';
    if (!Number.isFinite(fare) || fare <= 0) nextErrors.totalFare = 'Enter the total fare';
    if (!meetingPoint) nextErrors.meetingPoint = 'Pick a meeting point';
    if (!departureTime) nextErrors.departureTime = 'Pick the departure time';
    else if (isDepartureTimeInPast(departureTime))
      nextErrors.departureTime = 'Pick a time later than now today';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const host = contactFromProfile(profile);
    const ride = createRide({
      host,
      destination,
      distance: knownDestination?.distance ?? 'Custom route',
      note: knownDestination?.note ?? 'Custom destination',
      meetingPoint,
      departureTime,
      totalFare: Math.round(fare),
      totalSeats: Number(seats),
    });
    recordPoolHost({
      kind: 'ride',
      poolId: ride.id,
      poolLabel: `Ride to ${ride.destination}`,
      detail: `${ride.departureTime} · ${ride.meetingPoint}`,
      href: '/ride',
      host,
    });

    toast.success('Ride pool created', {
      description: `${seats} seats · ₹${ride.farePerSeat} per seat · ${ride.departureTime} from ${ride.meetingPoint}`,
    });
    resetHostForm();
    setHostOpen(false);
  };

  const handleJoinRide = (ride: RidePool) => {
    if (!profile) return;
    if (ride.hostId === profile.id) {
      toast.error('You host this ride pool');
      return;
    }
    if (isRideDeparted(ride)) {
      toast.error('This ride has already departed');
      return;
    }
    const member = contactFromProfile(profile);
    const updated = joinRide(ride.id, member);
    if (!updated) {
      toast.error('This ride pool is already full');
      return;
    }

    recordPoolJoin({
      kind: 'ride',
      poolId: ride.id,
      poolLabel: `Ride to ${ride.destination}`,
      detail: `${ride.departureTime} · ${ride.meetingPoint}`,
      href: '/ride',
      host: {
        userId: ride.hostId,
        name: ride.hostName,
        phone: ride.hostPhone,
        hostel: ride.hostHostel,
        room: null,
      },
      member,
    });

    const seatsLeft = updated.totalSeats - updated.members.length;
    toast.success(`Joined ride to ${ride.destination}!`, {
      description:
        seatsLeft > 0
          ? `Seat reserved for ₹${ride.farePerSeat} · ${seatsLeft} left`
          : `Seat reserved for ₹${ride.farePerSeat} · this pool is now full`,
    });
    addNotification(profile.id, {
      kind: 'ride',
      title: `Seat booked for ${ride.destination}`,
      body: `Departs ${ride.departureTime} from ${ride.meetingPoint}. ₹${ride.farePerSeat} per seat.`,
      href: '/requests',
    });
    addNotification(ride.hostId, {
      kind: 'ride',
      title: `${member.name} joined your ride to ${ride.destination}`,
      body: `${updated.members.length}/${updated.totalSeats} seats booked · ${member.phone ? `+91 ${member.phone}` : 'phone not shared'}. Departs ${ride.departureTime} from ${ride.meetingPoint}.`,
      href: '/requests',
    });
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
            onClick={() => setHostOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Offer / Host a Ride
          </button>
        </div>
      </div>

      {hiddenRideCount > 0 ? (
        <p className="text-[11.5px] text-slate-500">
          {hiddenRideCount === 1 ? '1 of your rides is' : `${hiddenRideCount} of your rides are`}{' '}
          hidden from this list — track them in{' '}
          <Link to="/requests" className="font-bold text-emerald-700 hover:underline">
            Requests
          </Link>
          .
        </p>
      ) : null}

      {/* Ride Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {openRides.length === 0 ? (
          <div className="stitch-card col-span-full bg-white py-10 text-center">
            <p className="text-[13px] font-bold text-slate-700">No open rides right now</p>
            <p className="mt-1 text-[11.5px] text-slate-500">
              {hiddenRideCount > 0
                ? 'You have hosted or joined the active pools — track their status in Requests.'
                : 'Offer a ride to your station or the airport and fill the seats with your corridor.'}
            </p>
          </div>
        ) : null}
        {openRides.map((ride) => {
          const bookedSeats = ride.members.length;
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
                          idx < bookedSeats
                            ? 'bg-emerald-600 shadow-xs'
                            : 'border-2 border-slate-300 bg-white',
                        )}
                      />
                    ))}
                    <span className="ml-1.5 font-mono text-[12px] font-bold text-slate-700">
                      {bookedSeats}/{ride.totalSeats} seats
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
                onClick={() => handleJoinRide(ride)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 font-bold text-white shadow-sm transition-all hover:bg-emerald-800 active:scale-[0.99]"
              >
                <span>Join Pool (₹{ride.farePerSeat})</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Dialog
        open={hostOpen}
        onOpenChange={(open) => {
          setHostOpen(open);
          if (!open) resetHostForm();
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offer / Host a Ride</DialogTitle>
            <DialogDescription>
              Pick your destination, total fare, seats, and pickup. Joiners see your phone number
              under their claimed requests.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleHostRide} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="ride-destination">Destination</Label>
              <Select
                value={destinationChoice}
                onValueChange={(value) => {
                  setDestinationChoice(value);
                  setErrors((current) => ({ ...current, destination: undefined }));
                }}
              >
                <SelectTrigger id="ride-destination" className="mt-2">
                  <SelectValue placeholder="Pick a destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Nearby railway stations</SelectLabel>
                    {RAILWAY_STATIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Airport</SelectLabel>
                    {AIRPORTS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.value}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Other</SelectLabel>
                    <SelectItem value={OTHER_DESTINATION}>Other destination…</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {destinationChoice === OTHER_DESTINATION ? (
              <div>
                <Label htmlFor="ride-custom-destination">Destination name</Label>
                <Input
                  id="ride-custom-destination"
                  className="mt-2"
                  placeholder="e.g. Gaya Junction or Muzaffarpur"
                  value={customDestination}
                  onChange={(event) => {
                    setCustomDestination(event.target.value);
                    setErrors((current) => ({ ...current, destination: undefined }));
                  }}
                  aria-invalid={Boolean(errors.destination)}
                />
                {errors.destination ? (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
                    {errors.destination}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="ride-fare">Total fare (₹)</Label>
                <Input
                  id="ride-fare"
                  className="mt-2"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="400"
                  value={totalFare}
                  onChange={(event) => {
                    setTotalFare(event.target.value);
                    setErrors((current) => ({ ...current, totalFare: undefined }));
                  }}
                  aria-invalid={Boolean(errors.totalFare)}
                />
                {errors.totalFare ? (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
                    {errors.totalFare}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="ride-seats">Seats</Label>
                <Select value={seats} onValueChange={setSeats}>
                  <SelectTrigger id="ride-seats" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEAT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option} seats
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {farePreview ? (
              <p className="text-[11.5px] text-slate-500">
                Split: <strong className="text-emerald-800">₹{farePreview} per seat</strong> across{' '}
                {seats} seats.
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="ride-meeting-point">Meeting point</Label>
                <Select
                  value={meetingPoint}
                  onValueChange={(value) => {
                    setMeetingPoint(value);
                    setErrors((current) => ({ ...current, meetingPoint: undefined }));
                  }}
                >
                  <SelectTrigger id="ride-meeting-point" className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_POINTS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.meetingPoint ? (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
                    {errors.meetingPoint}
                  </p>
                ) : null}
              </div>
              <div>
                <Label htmlFor="ride-departure">Departure time</Label>
                <Input
                  id="ride-departure"
                  className="mt-2"
                  type="time"
                  value={departureTime}
                  onChange={(event) => {
                    setDepartureTime(event.target.value);
                    setErrors((current) => ({ ...current, departureTime: undefined }));
                  }}
                  aria-invalid={Boolean(errors.departureTime)}
                />
                {errors.departureTime ? (
                  <p className="mt-1.5 text-[11.5px] font-semibold text-destructive">
                    {errors.departureTime}
                  </p>
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setHostOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create ride pool</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
