import { authContext } from '@/utils/AuthContext';
import { Link, Stack } from 'expo-router';
import 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useContext } from 'react';
import { TouchableOpacity } from 'react-native';


export default function RootLayout() {
  const colorScheme = useColorScheme();

	const authState = useContext(authContext);
  
  return (
          <Stack>
						<Stack.Screen
              name="index"
              options={{
                title: 'Snack',
                animation: "none",
                headerLeft: () => (
                <Link href='/AdminSnack/productForm' dismissTo asChild>
                  <TouchableOpacity>
                    <ThemedText style={{ color: 'black' }}>Nouveau</ThemedText>
                  </TouchableOpacity>
                </Link>
              ),
                headerRight: () => (
                <Link href='/AdminSnack/snackHistory' asChild>
                  <TouchableOpacity>
                    <ThemedText style={{ color: 'black' }}>Historique</ThemedText>
                  </TouchableOpacity>
                </Link>
              ),
              }}
            />
            <Stack.Screen
              name="snackHistory"
              options={{
                title: 'Historique',
                animation: "none",
                headerLeft: () => (
                <Link href='/AdminSnack' dismissTo asChild>
                  <TouchableOpacity>
                    <ThemedText style={{ color: 'black' }}>← Retour</ThemedText>
                  </TouchableOpacity>
                </Link>
              ),
              }}
            />
            <Stack.Screen
              name="productForm"
              options={{
                title: 'Ajouter produit',
                animation: "none",
                headerLeft: () => (
                <Link href='/AdminSnack' dismissTo asChild>
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
