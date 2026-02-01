import { authContext } from '@/context/AuthContext';
import { Stack } from 'expo-router';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useContext } from 'react';


export default function RootLayout() {
  const colorScheme = useColorScheme();

	const authState = useContext(authContext);
  
  return (
          <Stack>
						<Stack.Screen
              name="index"
              options={{
                title: 'Réglages',
                animation: "none",
              }}
            />

            <Stack.Screen
              name="products/index"
              options={{
                title: 'Produits',
                animation: "none",
              }}
            />

            <Stack.Screen
              name="products/form"
              options={{
                title: 'Formulaire produit',
                animation: "none",
              }}
            />

          </Stack>
  );
}
