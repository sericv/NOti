/**
 * Alternate app icon service for Nudge.
 *
 * Changing app icons requires native capabilities provided by `ExpoAlternateAppIcons`.
 * In Expo Go, custom native modules are not available. This service safely detects
 * the runtime environment and native module availability before making any native calls,
 * preventing crashes and guiding the user with a clear explanation.
 *
 * Supports:
 * - Al Rajhi: Primary App Icon (default, name: null)
 * - Labayh: Alternate App Icon (name: 'Libya')
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { requireOptionalNativeModule } from 'expo-modules-core';
import { Alert, Platform } from 'react-native';

export type AppIconId = 'alrajhi' | 'libya';

export interface AppIconOption {
  id: AppIconId;
  name: string | null; // null for primary (Al Rajhi), 'Libya' for alternate (Labayh)
  labelAr: string;
  labelEn: string;
  source: any;
  isPrimary: boolean;
}

export const APP_ICONS: AppIconOption[] = [
  {
    id: 'alrajhi',
    name: null,
    labelAr: 'الراجحي',
    labelEn: 'Al Rajhi',
    source: require('@/assets/images/الراجحي.png'),
    isPrimary: true,
  },
  {
    id: 'libya',
    name: 'Libya',
    labelAr: 'لبيه',
    labelEn: 'Labayh',
    source: require('@/assets/images/لبيه.png'),
    isPrimary: false,
  },
];

const SELECTED_ICON_KEY = 'nudge.selected_app_icon.v1';

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
 * Reads the persisted app icon selection.
 * Priority:
 * 1. Native iOS query via getActiveAppIconName() (ground truth if available).
 * 2. AsyncStorage cached value.
 * 3. Default ('alrajhi').
 */
export async function getSavedAppIconId(): Promise<AppIconId> {
  try {
    if (Platform.OS === 'ios' && !isExpoGo) {
      const activeNativeName = getActiveAppIconName();
      if (activeNativeName === 'Libya') {
        return 'libya';
      }
      if (activeNativeName === null) {
        return 'alrajhi';
      }
    }

    const saved = await AsyncStorage.getItem(SELECTED_ICON_KEY);
    if (saved === 'libya' || saved === 'alrajhi') {
      return saved;
    }
    return 'alrajhi';
  } catch {
    return 'alrajhi';
  }
}

/**
 * Persists the selected icon id in AsyncStorage.
 */
export async function saveAppIconId(id: AppIconId): Promise<void> {
  try {
    await AsyncStorage.setItem(SELECTED_ICON_KEY, id);
  } catch (error) {
    console.error('Failed to save selected app icon ID:', error);
  }
}

/**
 * Switches the app icon and saves the state upon success.
 * - Passing null restores the Primary App Icon (Al Rajhi).
 * - Passing 'Libya' sets the Alternate App Icon (Labayh).
 */
export async function switchAppIcon(icon: AppIconOption): Promise<boolean> {
  const success = await setAlternateAppIconSafe(icon.name);
  if (success) {
    await saveAppIconId(icon.id);
  }
  return success;
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
