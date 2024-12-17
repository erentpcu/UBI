import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { Provider, useSelector } from 'react-redux';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { subscribeToAuthChanges } from './secrets/auth';
import { store } from '../app/store';
import { loadStoredUser } from './store/authSlice';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const colorScheme = useColorScheme();
  const { top, bottom, right, left } = useSafeAreaInsets();
  const user = useSelector((state: any) => state.auth.user);

  useEffect(() => {
    store.dispatch(loadStoredUser());
    
    const unsubscribe = subscribeToAuthChanges(() => {});

    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaProvider style={{ paddingTop: top, paddingBottom: bottom, paddingRight: right, paddingLeft: left }}>
        <Stack 
          initialRouteName={user ? 'Connection' : 'login/login'} 
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login/login" />
          <Stack.Screen 
            name="Connection" 
            options={{
              headerShown: false,
              gestureEnabled: false
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
