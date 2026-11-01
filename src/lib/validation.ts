export const STUDENT_EMAIL_RE = /^btech15\d{3}\.\d{2}@bitmesra\.ac\.in$/;
export const STUDENT_EMAIL_MESSAGE = 'Registration restricted to valid BIT Patna student IDs';
export const UPI_RE = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
export const PHONE_RE = /^[6-9]\d{9}$/;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function validateStudentEmail(email: string): string | null {
  if (!email.trim()) return 'Enter your BIT Patna email ID';
  if (!STUDENT_EMAIL_RE.test(normalizeEmail(email))) return STUDENT_EMAIL_MESSAGE;
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Enter a password';
  if (password.length < 8) return 'Use at least 8 characters';
  return null;
}

export function validateUpi(upi: string): string | null {
  if (!upi.trim()) return 'Add your UPI ID so pool-mates can pay you';
  if (!UPI_RE.test(upi.trim())) return 'That UPI ID doesn’t look right (e.g. name@okhdfcbank)';
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Tell us your full name';
  if (name.trim().length < 2) return 'Name is too short';
  return null;
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  return digits;
}

export function validatePhone(phone: string): string | null {
  const digits = normalizePhone(phone);
  if (!digits) return 'Add your phone number for handoffs';
  if (!PHONE_RE.test(digits)) return 'Enter a valid 10-digit mobile number';
  return null;
}
