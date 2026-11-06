/**
 * Reminder state hook: single source of truth for the reminder list.
 *
 * Coordinates the notification service (native OS scheduling) with persistent
 * storage, and guards against duplicate scheduling via an in-flight id set.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import type { NewReminderInput, Reminder } from '@/models/reminder';
import { toSeconds } from '@/models/reminder';
import {
  cancelNotification,
  getPermissionState,
  requestPermission,
  scheduleInSeconds,
  type PermissionState,
} from '@/services/notifications';
import { loadReminders, saveReminders } from '@/services/storage';

function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [permission, setPermission] = useState<PermissionState>('undetermined');
  const [loading, setLoading] = useState(true);
  // Guards against double-submits scheduling the same reminder twice.
  const inFlight = useRef(false);

  // Initial load + permission probe.
  useEffect(() => {
    let active = true;
    (async () => {
      const [stored, perm] = await Promise.all([loadReminders(), getPermissionState()]);
      if (!active) return;
      setReminders(stored);
      setPermission(perm);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  // Persist on every change (after initial load).
  const persist = useCallback((next: Reminder[]) => {
    setReminders(next);
    void saveReminders(next);
  }, []);

  const ensurePermission = useCallback(async (): Promise<PermissionState> => {
    const next = await requestPermission();
    setPermission(next);
    return next;
  }, []);

  const addReminder = useCallback(
    async (input: NewReminderInput): Promise<Reminder | null> => {
      if (inFlight.current) return null; // dedupe concurrent submits
      inFlight.current = true;
      try {
        const perm = await requestPermission();
        setPermission(perm);
        if (perm !== 'granted') return null;

        const seconds = toSeconds(input.amount, input.unit);
        const title = input.title.trim() || 'NUDGE';
        const notificationId = await scheduleInSeconds(title, input.body.trim(), seconds);

        const reminder: Reminder = {
          id: makeId(),
          title,
          body: input.body.trim(),
          amount: input.amount,
          unit: input.unit,
          fireAt: Date.now() + seconds * 1000,
          notificationId,
          createdAt: Date.now(),
        };
        persist([reminder, ...reminders]);
        return reminder;
      } finally {
        inFlight.current = false;
      }
    },
    [persist, reminders],
  );

  const removeReminder = useCallback(
    async (id: string): Promise<void> => {
      const target = reminders.find((r) => r.id === id);
      if (target?.notificationId) {
        await cancelNotification(target.notificationId);
      }
      persist(reminders.filter((r) => r.id !== id));
    },
    [persist, reminders],
  );

  return {
    reminders,
    permission,
    loading,
    addReminder,
    removeReminder,
    ensurePermission,
  };
}
