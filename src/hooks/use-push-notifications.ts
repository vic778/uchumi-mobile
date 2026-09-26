import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { api } from '@/services/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert:  true,
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  true,
    shouldSetBadge:   true,
  }),
});

async function registerAndSaveToken() {
  if (!Device.isDevice) return;

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
    registerAndSaveToken().catch(() => {});

    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      // Tapping a notification brings the app to foreground automatically
    });

    return () => sub.remove();
  }, []);
}
