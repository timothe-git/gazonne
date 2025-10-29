import React, { useContext } from 'react';

import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { authContext } from '@/utils/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const authState = useContext(authContext);


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
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
        name="SnackScreen"
        options={{
          title: 'Le snack',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: authState.isAdmin ? null : '/SnackScreen',
        }}
      />
      <Tabs.Screen
        name="snackScreenAdmin"
        options={{
          title: 'Le snack',
          header: () => null,
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: authState.isAdmin ? '/snackScreenAdmin' : null,
        }}
      />
      <Tabs.Screen
        name="BarScreen"
        options={{
          title: 'Le bar',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          href: null,
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
        name="SettingsScreen"
        options={{
          title: 'Réglages',
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
    </Tabs>
  );
}
