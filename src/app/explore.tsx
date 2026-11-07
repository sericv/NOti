import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { lang, t } from '@/i18n/strings';
import {
  APP_ICONS,
  AppIconId,
  AppIconOption,
  getSavedAppIconId,
  isExpoGo,
  switchAppIcon,
} from '@/services/app-icon';

const ACTIVE_COLOR = '#007AFF';

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const [selectedIconId, setSelectedIconId] = useState<AppIconId>('alrajhi');

  useEffect(() => {
    getSavedAppIconId().then(setSelectedIconId);
  }, []);

  const handleSelectIcon = async (icon: AppIconOption) => {
    if (selectedIconId === icon.id) return;
    const success = await switchAppIcon(icon);
    if (success) {
      setSelectedIconId(icon.id);
    }
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="subtitle">Settings</ThemedText>
        </ThemedView>

        <ThemedView style={styles.sectionsWrapper}>
          <Collapsible title={t('appIcon')}>
            <View style={styles.iconRow}>
              {APP_ICONS.map((icon) => {
                const isSelected = selectedIconId === icon.id;
                const label = lang === 'ar' ? icon.labelAr : icon.labelEn;
                const typeLabel = icon.isPrimary
                  ? t('primaryIconBadge')
                  : t('alternateIconBadge');

                return (
                  <Pressable
                    key={icon.id}
                    onPress={() => handleSelectIcon(icon)}
                    style={[
                      styles.iconCard,
                      { backgroundColor: theme.backgroundElement },
                      isSelected && [styles.iconCardSelected, { borderColor: ACTIVE_COLOR }],
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${label} - ${isSelected ? t('active') : ''}`}
                    accessibilityState={{ selected: isSelected }}>
                    <View style={styles.iconImageWrapper}>
                      <Image source={icon.source} style={styles.iconImage} contentFit="cover" />
                      {isSelected && (
                        <View style={[styles.checkBadge, { backgroundColor: ACTIVE_COLOR }]}>
                          <ThemedText style={styles.checkText}>✓</ThemedText>
                        </View>
                      )}
                    </View>
                    <ThemedText
                      type={isSelected ? 'smallBold' : 'small'}
                      style={styles.iconTitle}>
                      {label}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      themeColor={isSelected ? 'text' : 'textSecondary'}
                      style={[styles.iconSubtitle, isSelected && { color: ACTIVE_COLOR }]}>
                      {isSelected ? `● ${t('active')}` : typeLabel}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <ThemedText
              type="small"
              themeColor="textSecondary"
              style={styles.iconNotice}>
              {t('iconNotificationNote')}
            </ThemedText>

            {isExpoGo && (
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={styles.expoGoNote}>
                {t('expoGoIconNote')}
              </ThemedText>
            )}
          </Collapsible>

          <Collapsible title="File-based routing">
            <ThemedText type="small">
              This app has two screens: <ThemedText type="code">src/app/index.tsx</ThemedText> and{' '}
              <ThemedText type="code">src/app/explore.tsx</ThemedText>
            </ThemedText>
            <ThemedText type="small">
              The layout file in <ThemedText type="code">src/app/_layout.tsx</ThemedText> sets up
              the tab navigator.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Android, iOS, and web support">
            <ThemedView type="backgroundElement" style={styles.collapsibleContent}>
              <ThemedText type="small">
                You can open this project on Android, iOS, and the web. To open the web version,
                press <ThemedText type="smallBold">w</ThemedText> in the terminal running this
                project.
              </ThemedText>
              <Image
                source={require('@/assets/images/tutorial-web.png')}
                style={styles.imageTutorial}
              />
            </ThemedView>
          </Collapsible>

          <Collapsible title="Images">
            <ThemedText type="small">
              For static images, you can use the <ThemedText type="code">@2x</ThemedText> and{' '}
              <ThemedText type="code">@3x</ThemedText> suffixes to provide files for different
              screen densities.
            </ThemedText>
            <Image source={require('@/assets/images/react-logo.png')} style={styles.imageReact} />
            <ExternalLink href="https://reactnative.dev/docs/images">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Light and dark mode components">
            <ThemedText type="small">
              This template has light and dark mode support. The{' '}
              <ThemedText type="code">useColorScheme()</ThemedText> hook lets you inspect what the
              user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
            </ThemedText>
            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <ThemedText type="linkPrimary">Learn more</ThemedText>
            </ExternalLink>
          </Collapsible>

          <Collapsible title="Animations">
            <ThemedText type="small">
              This template includes an example of an animated component. The{' '}
              <ThemedText type="code">src/components/ui/collapsible.tsx</ThemedText> component uses
              the powerful <ThemedText type="code">react-native-reanimated</ThemedText> library to
              animate opening this hint.
            </ThemedText>
          </Collapsible>
        </ThemedView>
        {Platform.OS === 'web' && <WebBadge />}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.five,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: 'center',
  },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
  iconRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'center',
    paddingVertical: Spacing.two,
  },
  iconCard: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 124,
    gap: Spacing.one,
  },
  iconCardSelected: {
    borderWidth: 2,
  },
  iconImageWrapper: {
    position: 'relative',
  },
  iconImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
  },
  checkBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  iconTitle: {
    marginTop: Spacing.one,
    textAlign: 'center',
  },
  iconSubtitle: {
    fontSize: 11,
    textAlign: 'center',
  },
  iconNotice: {
    textAlign: 'center',
    paddingHorizontal: Spacing.two,
    paddingTop: Spacing.two,
    lineHeight: 18,
  },
  expoGoNote: {
    textAlign: 'center',
    paddingTop: Spacing.two,
    lineHeight: 18,
  },
});
