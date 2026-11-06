/** Persistent reminder storage backed by AsyncStorage. */

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Reminder } from '@/models/reminder';

const STORAGE_KEY = 'nudge.reminders.v1';

/** Read all reminders. Returns [] on empty or corrupt data (never throws). */
export async function loadReminders(): Promise<Reminder[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Shallow validation: drop entries missing an id.
    return parsed.filter((r): r is Reminder => r && typeof r.id === 'string');
  } catch {
    return [];
  }
}

/** Overwrite the full reminder list. */
export async function saveReminders(reminders: Reminder[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
}
