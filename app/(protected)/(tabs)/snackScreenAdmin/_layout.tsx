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
                <Link href='/snackScreenAdmin/ProductForm' dismissTo asChild>
                  <TouchableOpacity>
                    <ThemedText style={{ color: 'black' }}>Nouveau</ThemedText>
                  </TouchableOpacity>
                </Link>
              ),
                headerRight: () => (
                <Link href='/snackScreenAdmin/SnackHistory' asChild>
                  <TouchableOpacity>
                    <ThemedText style={{ color: 'black' }}>Historique</ThemedText>
                  </TouchableOpacity>
                </Link>
              ),
              }}
            />
            <Stack.Screen
              name="SnackHistory"
              options={{
                title: 'Historique',
                animation: "none",
                headerLeft: () => (
                <Link href='/snackScreenAdmin' dismissTo asChild>
                  <TouchableOpacity>
                    <ThemedText style={{ color: 'black' }}>← Retour</ThemedText>
                  </TouchableOpacity>
                </Link>
              ),
              }}
            />
            <Stack.Screen
              name="ProductForm"
              options={{
                title: 'Ajouter produit',
                animation: "none",
                headerLeft: () => (
                <Link href='/snackScreenAdmin' dismissTo asChild>
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
