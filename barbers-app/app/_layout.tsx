import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider } from '@/context/ThemeContext';
import { initializeStripe } from '@/lib/stripe';
import { usePushNotifications } from '@/hooks/usePushNotifications';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { expoPushToken } = usePushNotifications();

  useEffect(() => {
    initializeStripe();
    if (expoPushToken) {
      console.log('Push Token registrado:', expoPushToken.data);
    }
    // Oculta a splash screen assim que o componente estiver pronto
    SplashScreen.hideAsync().catch(() => {});
  }, [expoPushToken]);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
