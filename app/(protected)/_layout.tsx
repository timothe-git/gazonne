import { authContext } from '@/utils/AuthContext';
import { breakfastOrderContext, BreakfastOrderProvider } from '@/utils/BreakfastOrderContext';
import { Redirect, Stack } from 'expo-router';
import { useContext } from 'react';
import 'react-native-reanimated';

export default function ProtectedLayout() {

  const authState = useContext(authContext);
  const breakfastOrderState = useContext(breakfastOrderContext);
  
  
  if (!authState.isReady && !breakfastOrderState.isReady) {
    return null;
  }


  if (!authState.isLoggedIn) {
    return <Redirect href="/login" />;
  }

  return (
    <BreakfastOrderProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </BreakfastOrderProvider>
  );
}
