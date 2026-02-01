import { Stack } from 'expo-router';
import 'react-native-reanimated';



export default function SettingsLayout() {
  
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

            <Stack.Screen
              name="order-history"
              options={{
                title: 'Historique des commandes',
                animation: "none",
              }}
            />

            <Stack.Screen
              name="activities/index"
              options={{
                title: 'Modifier les activités',
                animation: "none",
              }}
            />

            <Stack.Screen
              name="activities/form"
              options={{
                title: 'Formulaire activité',
                animation: "none",
              }}
            />

            <Stack.Screen
              name="chalets/index"
              options={{
                title: 'Gestion des chalets',
                animation: "none",
              }}
            />

            <Stack.Screen
              name="chalets/consumption"
              options={{
                title: 'Consommations',
                animation: "none",
              }}
            />

          </Stack>
  );
}
