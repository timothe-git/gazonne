import { useContext } from 'react';

import { Tabs } from 'expo-router';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/Colors';
import { authContext } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const authState = useContext(authContext);


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ActivitiesScreen"
        options={{
          title: 'Activités',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="MenuScreen"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: authState.isAdmin ? null : '/MenuScreen',
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: 'Commande',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: authState.isAdmin ? '/order' : null,
        }}
      />
      <Tabs.Screen
        name="AnnouncementsScreen"
        options={{
          title: 'Annonces',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="BreakfastOrderScreen"
        options={{
          title: 'petit-déj',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: authState.isAdmin ? null : '/BreakfastOrderScreen',
        }}
      />
      <Tabs.Screen
        name="BreakfastOrderAdmin"
        options={{
          title: 'petit-déj',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: authState.isAdmin ? '/BreakfastOrderAdmin' : null,
        }}
      />
      <Tabs.Screen
      name="settings"
      options={{
        title: 'Réglages',
        tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        href: authState.isLoggedIn ? '/settings' : null,
        headerShown: false,
      }}
      />
    </Tabs>
  );
}
