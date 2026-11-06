/** Human-readable remaining-time formatting, localized EN/AR. */

import { t } from '@/i18n/strings';

/**
 * Format the gap between `fireAt` and `now` (both epoch ms) as e.g.
 * "2 hours", "45 seconds". Returns the "due now" label at or past the mark.
 */
export function formatRemaining(fireAt: number, now: number): string {
  const diffMs = fireAt - now;
  if (diffMs <= 0) return t('due');

  const totalSec = Math.ceil(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  if (days > 0) return `${t('firesIn')} ${days} ${days === 1 ? t('day') : t('days')}`;
  if (hours > 0) return `${t('firesIn')} ${hours} ${hours === 1 ? t('hour') : t('hours')}`;
  if (minutes > 0) return `${t('firesIn')} ${minutes} ${minutes === 1 ? t('minute') : t('minutes')}`;
  return `${t('firesIn')} ${seconds} ${seconds === 1 ? t('second') : t('seconds')}`;
}
