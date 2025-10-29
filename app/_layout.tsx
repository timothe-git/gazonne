import { AuthProvider } from '@/utils/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  
  return (
    <SafeAreaProvider>
      <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen
                name="(protected)"
                options={{
                  headerShown: false,
                  animation: "none",
                }}
              />
              <Stack.Screen
                name="login"
                options={{
                  headerShown: false,
                  animation: "none",
                }}
              />
              <Stack.Screen
                name="register"
                options={{
                  headerShown: false,
                  animation: "none",
                }}
              />
              <Stack.Screen
                name="qrScan"
                options={{
                  headerShown: false,
                  animation: "none",
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
