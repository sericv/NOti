/** Minimal EN/AR string table with device-locale selection and RTL flag. */

import { getLocales } from 'expo-localization';

import type { TimeUnit } from '@/models/reminder';

type Lang = 'en' | 'ar';

const resources = {
  en: {
    appName: 'NUDGE',
    tagline: 'Gentle local reminders',
    newReminder: 'New reminder',
    title: 'Title',
    titlePlaceholder: 'What should we remind you about?',
    note: 'Note',
    notePlaceholder: 'Optional details',
    remindIn: 'Remind me in',
    amount: 'Amount',
    schedule: 'Schedule reminder',
    empty: 'No reminders yet',
    emptyHint: 'Add one below to get started.',
    delete: 'Delete',
    firesIn: 'in',
    due: 'Due now',
    permissionDenied: 'Notifications are turned off',
    permissionDeniedHint: 'Enable them in Settings to receive reminders.',
    openSettings: 'Open Settings',
    enable: 'Enable notifications',
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    second: 'second',
    minute: 'minute',
    hour: 'hour',
    day: 'day',
    days: 'days',
  },
  ar: {
    appName: 'نَدج',
    tagline: 'تذكيرات محلية لطيفة',
    newReminder: 'تذكير جديد',
    title: 'العنوان',
    titlePlaceholder: 'بماذا تريد أن نذكّرك؟',
    note: 'ملاحظة',
    notePlaceholder: 'تفاصيل اختيارية',
    remindIn: 'ذكّرني بعد',
    amount: 'المقدار',
    schedule: 'جدولة التذكير',
    empty: 'لا توجد تذكيرات بعد',
    emptyHint: 'أضف واحداً بالأسفل للبدء.',
    delete: 'حذف',
    firesIn: 'خلال',
    due: 'حان الآن',
    permissionDenied: 'الإشعارات معطّلة',
    permissionDeniedHint: 'فعّلها من الإعدادات لتصلك التذكيرات.',
    openSettings: 'فتح الإعدادات',
    enable: 'تفعيل الإشعارات',
    seconds: 'ثوانٍ',
    minutes: 'دقائق',
    hours: 'ساعات',
    second: 'ثانية',
    minute: 'دقيقة',
    hour: 'ساعة',
    day: 'يوم',
    days: 'أيام',
  },
} as const;

export type StringKey = keyof (typeof resources)['en'];

function resolveLang(): Lang {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return code === 'ar' ? 'ar' : 'en';
}

export const lang: Lang = resolveLang();
export const isRTL: boolean = lang === 'ar';

/** Translate a key for the active device language. */
export function t(key: StringKey): string {
  return resources[lang][key];
}

/** Localized label for a time unit (plural). */
export function unitLabel(unit: TimeUnit): string {
  return t(unit);
}
