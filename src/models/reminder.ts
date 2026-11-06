/** Reminder domain models and time-unit helpers. */

export type TimeUnit = 'seconds' | 'minutes' | 'hours';

/** A single scheduled reminder, persisted to AsyncStorage. */
export type Reminder = {
  /** Stable app-side id (UUID-ish). Also used as the dedupe key. */
  id: string;
  title: string;
  body: string;
  /** Delay the user asked for, kept for display/editing. */
  amount: number;
  unit: TimeUnit;
  /** Absolute epoch ms when the OS will fire the notification. */
  fireAt: number;
  /** Native identifier returned by expo-notifications; null if unscheduled. */
  notificationId: string | null;
  /** Epoch ms the reminder was created. */
  createdAt: number;
};

/** Fields the UI supplies when creating a reminder. */
export type NewReminderInput = {
  title: string;
  body: string;
  amount: number;
  unit: TimeUnit;
};

export const TIME_UNITS: readonly TimeUnit[] = ['seconds', 'minutes', 'hours'];

/** Convert an amount + unit to seconds. Floors to an integer >= 1. */
export function toSeconds(amount: number, unit: TimeUnit): number {
  const perUnit = unit === 'hours' ? 3600 : unit === 'minutes' ? 60 : 1;
  return Math.max(1, Math.floor(amount * perUnit));
}
