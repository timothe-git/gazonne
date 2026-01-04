import { authContext } from '@/utils/AuthContext';
import { Stack } from 'expo-router';
import 'react-native-reanimated';


import { breakfastOrderContext } from '@/utils/BreakfastOrderContext';
import { useContext } from 'react';


export default function MainLayout() {

  const authState = useContext(authContext);
  const breakfastOrderState = useContext(breakfastOrderContext);
  
  
  if (!authState.isReady || !breakfastOrderState.isReady) {
    return null;
  }
  console.log(authState.isAdmin)


  
  return (            
    <Stack screenOptions={{ headerShown: false, animation: "none" }}>
      {authState?.isAdmin ? (
        <Stack.Screen name="(admin)" />
      ) : (
        <Stack.Screen name="(user)" />
      )}

      {/* Auth screens always accessible */}
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
