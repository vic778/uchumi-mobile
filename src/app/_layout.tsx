import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { fontAssets } from '@/constants/fonts';
import { AppLockProvider, useAppLock } from '@/context/app-lock-context';
import { AppLockScreen } from '@/components/ui/app-lock-screen';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { locked, unlock } = useAppLock();
  return (
    <>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(member)" />
      </Stack>
      <AppLockScreen visible={locked} onUnlock={unlock} />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <AppLockProvider>
          <AppContent />
        </AppLockProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
