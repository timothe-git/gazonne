import { ThemedText } from '@/components/themed-text';
import { Link, Stack } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import 'react-native-reanimated';

export default function AuthLayout() {
  return (
    <Stack>
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
  );
}
