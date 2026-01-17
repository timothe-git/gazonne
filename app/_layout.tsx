import { AuthProvider } from '@/context/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TouchableOpacity } from 'react-native';


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
                  animation: "none",
                  headerLeft: () => (
                    <Link href='/' dismissTo asChild>
                      <TouchableOpacity>
                        <ThemedText style={{ color: 'black' }}>← Retour</ThemedText>
                      </TouchableOpacity>
                    </Link>
                  ),
                }}
              />
              <Stack.Screen
                name="register"
                options={{
                  animation: "none",
                  headerLeft: () => (
                    <Link href='/' dismissTo asChild>
                      <TouchableOpacity>
                        <ThemedText style={{ color: 'black' }}>← Retour</ThemedText>
                      </TouchableOpacity>
                    </Link>
                  ),
                }}
              />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
