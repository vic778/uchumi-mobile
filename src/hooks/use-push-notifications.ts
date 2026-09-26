import { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { api } from '@/services/api';

// expo-notifications remote push was removed from Expo Go in SDK 53.
// Dynamic import + runtime guard prevents the crash in Expo Go.
const IS_EXPO_GO = Constants.appOwnership === 'expo';

async function registerAndSaveToken() {
  if (IS_EXPO_GO || !Device.isDevice) return;

  const Notifications = await import('expo-notifications');

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert:  true,
      shouldShowBanner: true,
      shouldShowList:   true,
      shouldPlaySound:  true,
      shouldSetBadge:   true,
    }),
  });

  const { status: current } = await Notifications.getPermissionsAsync();
  const { status } = current === 'granted'
    ? { status: current }
    : await Notifications.requestPermissionsAsync();

  if (status !== 'granted') return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name:             'Uchumi',
      importance:       Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor:       '#208AEF',
    });
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  await api.patch('/push_token', { push_token: token });
}

export function usePushNotifications() {
  useEffect(() => {
    if (!IS_EXPO_GO) {
      registerAndSaveToken().catch(() => {});
    }
  }, []);
}
