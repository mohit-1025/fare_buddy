const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function inr(amount: number) {
  return inrFormatter.format(Math.round(amount));
}

export function initials(name?: string | null) {
  if (!name) return 'FB';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso));
}

export function formatWindow(startIso: string, endIso: string) {
  return `${formatTime(startIso)}–${formatTime(endIso)}`;
}

export function formatDay(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso));
}

export function formatFullDate(iso: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date(iso));
}

export function hostelLabel(hostel?: string | null) {
  if (!hostel) return 'Hostel';
  const map: Record<string, string> = {
    'BH-1': 'BH-1',
    'BH-2': 'BH-2',
    'BH-3': 'BH-3',
    GH: 'GH',
  };
  return map[hostel] ?? hostel;
}

export function ceilShare(total: number, heads: number) {
  if (heads <= 0) return 0;
  return Math.ceil(total / heads);
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
