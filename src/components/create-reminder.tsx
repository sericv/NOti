/** Reminder creation form: title, note, amount, unit selector, submit. */

import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isRTL, t, unitLabel } from '@/i18n/strings';
import { TIME_UNITS, type NewReminderInput, type TimeUnit } from '@/models/reminder';

type Props = {
  onSubmit: (input: NewReminderInput) => void;
  submitting: boolean;
};

export function CreateReminder({ onSubmit, submitting }: Props) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [amountText, setAmountText] = useState('60');
  const [unit, setUnit] = useState<TimeUnit>('seconds');

  const amount = Number.parseInt(amountText, 10);
  const valid = title.trim().length > 0 && Number.isFinite(amount) && amount >= 1;

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.backgroundElement,
      color: theme.text,
      textAlign: isRTL ? ('right' as const) : ('left' as const),
    },
  ];

  function handleSubmit() {
    if (!valid || submitting) return;
    onSubmit({ title: title.trim(), body: body.trim(), amount, unit });
    setTitle('');
    setBody('');
    setAmountText('60');
    setUnit('seconds');
  }

  return (
    <ThemedView style={styles.form}>
      <ThemedText type="smallBold" style={styles.label}>
        {t('title')}
      </ThemedText>
      <TextInput
        style={inputStyle}
        value={title}
        onChangeText={setTitle}
        placeholder={t('titlePlaceholder')}
        placeholderTextColor={theme.textSecondary}
        returnKeyType="next"
      />

      <ThemedText type="smallBold" style={styles.label}>
        {t('note')}
      </ThemedText>
      <TextInput
        style={[inputStyle, styles.bodyInput]}
        value={body}
        onChangeText={setBody}
        placeholder={t('notePlaceholder')}
        placeholderTextColor={theme.textSecondary}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        returnKeyType="default"
      />

      <ThemedText type="smallBold" style={styles.label}>
        {t('remindIn')}
      </ThemedText>
      <View style={[styles.remindRow, isRTL && styles.remindRowRTL]}>
        <TextInput
          style={[inputStyle, styles.amount]}
          value={amountText}
          onChangeText={(v) => setAmountText(v.replace(/[^0-9]/g, ''))}
          keyboardType="number-pad"
          placeholder={t('amount')}
          placeholderTextColor={theme.textSecondary}
        />
        <View style={[styles.units, isRTL && styles.remindRowRTL]}>
          {TIME_UNITS.map((u) => {
            const selected = u === unit;
            return (
              <Pressable
                key={u}
                accessibilityRole="button"
                onPress={() => setUnit(u)}
                style={[
                  styles.unitChip,
                  {
                    backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement,
                  },
                ]}>
                <ThemedText type="small" themeColor={selected ? 'text' : 'textSecondary'}>
                  {unitLabel(u)}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={!valid || submitting}
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.submit,
          {
            backgroundColor: theme.text,
            opacity: !valid || submitting ? 0.4 : pressed ? 0.8 : 1,
          },
        ]}>
        <ThemedText type="smallBold" themeColor="background">
          {t('schedule')}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.two,
  },
  label: {
    marginTop: Spacing.two,
    textAlign: isRTL ? 'right' : 'left',
  },
  input: {
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    fontSize: 16,
  },
  bodyInput: {
    minHeight: 96,
    maxHeight: 200,
  },
  remindRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  remindRowRTL: {
    flexDirection: 'row-reverse',
  },
  amount: {
    width: 88,
  },
  units: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.one,
  },
  unitChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  submit: {
    marginTop: Spacing.three,
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
  },
});
