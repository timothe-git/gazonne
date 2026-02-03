import { Stack } from 'expo-router';

export default function EmployeesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitle: 'Employés',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'Employés',
        }}
      />
      <Stack.Screen
        name="form"
        options={{
          headerTitle: 'Employé',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
