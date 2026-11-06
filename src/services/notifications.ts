/**
 * Local-notification service (iOS-first, no remote push).
 *
 * All scheduling goes through the native OS via expo-notifications'
 * TIME_INTERVAL trigger — never a JavaScript timer — so reminders fire even
 * when the app is backgrounded or killed.
 */

import * as Notifications from 'expo-notifications';
import { IosAuthorizationStatus } from 'expo-notifications';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

/**
 * Install the foreground presentation handler once, at module import.
 * Without this, notifications that fire while the app is open show nothing.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/** Read current permission without prompting. */
export async function getPermissionState(): Promise<PermissionState> {
  const settings = await Notifications.getPermissionsAsync();
  return normalize(settings);
}

/** Prompt the user. Safe to call when already granted (no re-prompt). */
export async function requestPermission(): Promise<PermissionState> {
  const existing = await Notifications.getPermissionsAsync();
  if (normalize(existing) === 'granted') return 'granted';
  const settings = await Notifications.requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: true, allowSound: true },
  });
  return normalize(settings);
}

function normalize(settings: Notifications.NotificationPermissionsStatus): PermissionState {
  // iOS: prefer ios.status over the root status field (per Expo docs).
  const iosStatus = settings.ios?.status;
  if (
    iosStatus === IosAuthorizationStatus.AUTHORIZED ||
    iosStatus === IosAuthorizationStatus.PROVISIONAL ||
    iosStatus === IosAuthorizationStatus.EPHEMERAL ||
    settings.granted
  ) {
    return 'granted';
  }
  if (iosStatus === IosAuthorizationStatus.DENIED || settings.status === 'denied') {
    return 'denied';
  }
  return 'undetermined';
}

/**
 * Schedule one local notification `seconds` from now via the OS.
 * Returns the native notification identifier (persist it to cancel later).
 */
export async function scheduleInSeconds(
  title: string,
  body: string,
  seconds: number,
): Promise<string> {
  return Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.floor(seconds)),
      repeats: false,
    },
  });
}

/** Cancel one scheduled notification. No-op if it does not exist. */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}
