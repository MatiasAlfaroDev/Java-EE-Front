import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'IBMPlexSans-Regular':   require('../assets/fonts/IBMPlexSans-Regular.ttf'),
    'IBMPlexSans-Medium':    require('../assets/fonts/IBMPlexSans-Medium.ttf'),
    'IBMPlexSans-SemiBold':  require('../assets/fonts/IBMPlexSans-SemiBold.ttf'),
    'IBMPlexSans-Bold':      require('../assets/fonts/IBMPlexSans-Bold.ttf'),
    'IBMPlexMono-Regular':   require('../assets/fonts/IBMPlexMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={theme.bg} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}
