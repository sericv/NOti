import { Fragment } from 'react';
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CreateReminder } from '@/components/create-reminder';
import { ReminderCard } from '@/components/reminder-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useReminders } from '@/hooks/use-reminders';
import { useTheme } from '@/hooks/use-theme';
import { isRTL, t } from '@/i18n/strings';

export default function HomeScreen() {
  const theme = useTheme();
  const { reminders, permission, loading, addReminder, removeReminder, ensurePermission } =
    useReminders();

  const textAlign = { textAlign: isRTL ? ('right' as const) : ('left' as const) };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Header */}
            <ThemedView style={styles.header}>
              <ThemedText type="title" style={[styles.appName, textAlign]}>
                {t('appName')}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={textAlign}>
                {t('tagline')}
              </ThemedText>
            </ThemedView>

            {/* Permission banner (denied only) */}
            {permission === 'denied' && (
              <ThemedView type="backgroundElement" style={styles.banner}>
                <ThemedText type="smallBold" style={textAlign}>
                  {t('permissionDenied')}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={textAlign}>
                  {t('permissionDeniedHint')}
                </ThemedText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => Linking.openSettings()}
                  style={({ pressed }) => [
                    styles.bannerButton,
                    { backgroundColor: theme.backgroundSelected, opacity: pressed ? 0.6 : 1 },
                  ]}>
                  <ThemedText type="smallBold">{t('openSettings')}</ThemedText>
                </Pressable>
              </ThemedView>
            )}

            {permission === 'undetermined' && (
              <Pressable
                accessibilityRole="button"
                onPress={ensurePermission}
                style={({ pressed }) => [
                  styles.enable,
                  { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.6 : 1 },
                ]}>
                <ThemedText type="smallBold">{t('enable')}</ThemedText>
              </Pressable>
            )}

            {/* List */}
            <ThemedView style={styles.list}>
              {!loading && reminders.length === 0 ? (
                <ThemedView style={styles.empty}>
                  <ThemedText type="smallBold" style={styles.center}>
                    {t('empty')}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.center}>
                    {t('emptyHint')}
                  </ThemedText>
                </ThemedView>
              ) : (
                reminders.map((r) => (
                  <Fragment key={r.id}>
                    <ReminderCard reminder={r} onDelete={removeReminder} />
                  </Fragment>
                ))
              )}
            </ThemedView>

            {/* Create form */}
            <ThemedText type="smallBold" style={[styles.formTitle, textAlign]}>
              {t('newReminder')}
            </ThemedText>
            <CreateReminder onSubmit={addReminder} submitting={loading} />

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  safeArea: {
    flex: 1,
    alignSelf: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  scroll: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  header: {
    gap: Spacing.half,
    marginBottom: Spacing.two,
  },
  appName: {
    letterSpacing: 2,
  },
  banner: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  bannerButton: {
    alignSelf: isRTL ? 'flex-end' : 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  enable: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
  },
  list: {
    gap: Spacing.two,
  },
  empty: {
    alignItems: 'center',
    gap: Spacing.half,
    paddingVertical: Spacing.five,
  },
  center: {
    textAlign: 'center',
  },
  formTitle: {
    marginTop: Spacing.two,
  },
  bottomSpacer: {
    height: BottomTabInset + Spacing.four,
  },
});
