/** A single reminder row: title, note, remaining time, delete action. */

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNow } from '@/hooks/use-now';
import { formatRemaining } from '@/i18n/format';
import { isRTL, t } from '@/i18n/strings';
import type { Reminder } from '@/models/reminder';

type Props = {
  reminder: Reminder;
  onDelete: (id: string) => void;
};

export function ReminderCard({ reminder, onDelete }: Props) {
  const theme = useTheme();
  const now = useNow();
  const remaining = formatRemaining(reminder.fireAt, now);
  const isDue = reminder.fireAt - now <= 0;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={styles.texts}>
          <ThemedText type="smallBold" style={styles.textAlign} numberOfLines={1}>
            {reminder.title}
          </ThemedText>
          {reminder.body ? (
            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.textAlign}
              numberOfLines={2}>
              {reminder.body}
            </ThemedText>
          ) : null}
          <ThemedText
            type="small"
            themeColor={isDue ? 'text' : 'textSecondary'}
            style={styles.textAlign}>
            {remaining}
          </ThemedText>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('delete')}
          onPress={() => onDelete(reminder.id)}
          hitSlop={Spacing.two}
          style={({ pressed }) => [
            styles.delete,
            { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.6 : 1 },
          ]}>
          <ThemedText type="small">{t('delete')}</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  texts: {
    flex: 1,
    gap: Spacing.half,
  },
  textAlign: {
    textAlign: isRTL ? 'right' : 'left',
  },
  delete: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
});
