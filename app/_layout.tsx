import { AuthProvider } from '@/utils/AuthContext';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { BreakfastOrderProvider } from '@/utils/BreakfastOrderContext';


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
            <BreakfastOrderProvider>
            
              <Slot></Slot>
            
              <StatusBar style="auto" />
            </BreakfastOrderProvider>
          </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
