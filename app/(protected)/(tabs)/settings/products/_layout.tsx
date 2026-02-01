import { Stack } from 'expo-router';
import 'react-native-reanimated';

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Produits',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="form"
        options={{
          title: 'Produit',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
