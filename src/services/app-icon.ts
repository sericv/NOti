/**
 * Alternate app icon service for Nudge.
 *
 * Changing app icons requires native capabilities provided by `ExpoAlternateAppIcons`.
 * In Expo Go, custom native modules are not available. This service safely detects
 * the runtime environment and native module availability before making any native calls,
 * preventing crashes and guiding the user with a clear explanation.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Alert, Platform } from 'react-native';

export interface AlternateAppIconItem {
  name: string | null;
  label: string;
  source: any;
}

interface ExpoAlternateAppIconsNativeModule {
  supportsAlternateIcons?: boolean;
  setAlternateAppIcon(name: string | null): Promise<string | null>;
  getAppIconName(): string | null;
}

/**
 * Returns true if the app is currently running inside Expo Go client.
 */
export const isExpoGo: boolean =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

/**
 * Safely resolves the native module without throwing an error if it is not linked.
 */
export function getAlternateAppIconsModule(): ExpoAlternateAppIconsNativeModule | null {
  if (Platform.OS !== 'ios' || isExpoGo) {
    return null;
  }
  try {
    return requireOptionalNativeModule<ExpoAlternateAppIconsNativeModule>('ExpoAlternateAppIcons');
  } catch {
    return null;
  }
}

/**
 * Checks whether alternate app icons can actually be switched in the current runtime.
 */
export function isAlternateAppIconsAvailable(): boolean {
  if (Platform.OS !== 'ios' || isExpoGo) {
    return false;
  }
  const nativeModule = getAlternateAppIconsModule();
  return Boolean(nativeModule && (nativeModule.supportsAlternateIcons ?? true));
}

/**
 * Gets the current active alternate icon name, or null if default or unavailable.
 */
export function getActiveAppIconName(): string | null {
  const nativeModule = getAlternateAppIconsModule();
  if (!nativeModule) return null;
  try {
    return nativeModule.getAppIconName();
  } catch {
    return null;
  }
}

/**
 * Safely switches the application icon.
 * If running in Expo Go or if the native module is unavailable, shows a friendly alert.
 */
export async function setAlternateAppIconSafe(iconName: string | null): Promise<boolean> {
  if (isExpoGo) {
    Alert.alert(
      'تغيير أيقونة التطبيق غير مدعوم في Expo Go',
      'ميزة تغيير أيقونة التطبيق تتطلب بناء نسخة أصلية (Development Build / Native Build) ولا يمكن تشغيلها داخل تطبيق Expo Go.',
      [{ text: 'حسناً' }]
    );
    return false;
  }

  if (Platform.OS !== 'ios') {
    Alert.alert(
      'غير مدعوم',
      'تغيير أيقونة التطبيق مدعوم حالياً على نظام iOS فقط.',
      [{ text: 'حسناً' }]
    );
    return false;
  }

  const nativeModule = getAlternateAppIconsModule();
  if (!nativeModule) {
    Alert.alert(
      'الوحدة الأصلية غير متوفرة',
      'لم يتم العثور على وحدة ExpoAlternateAppIcons. تأكد من تشغيل التطبيق عبر Native Build (Development Build).',
      [{ text: 'حسناً' }]
    );
    return false;
  }

  try {
    await nativeModule.setAlternateAppIcon(iconName);
    return true;
  } catch (error) {
    console.error('Failed to set alternate app icon:', error);
    Alert.alert(
      'تعذر تغيير الأيقونة',
      'حدث خطأ أثناء محاولة تغيير أيقونة التطبيق. تأكد من إعداد الأيقونة في المشروع الأصلي.',
      [{ text: 'حسناً' }]
    );
    return false;
  }
}
