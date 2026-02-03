import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Employee } from '@/types/types';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query } from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function EmployeesScreen() {
  const router = useRouter();
  const db = getFirestore();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const cardBackground = useThemeColor({ light: '#F8FAFC', dark: '#1E2428' }, 'background');
  const cardBorder = useThemeColor({ light: '#E5E7EB', dark: '#2B3136' }, 'background');
  const subtleText = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  const accentColor = useThemeColor({ light: '#3B82F6', dark: '#60A5FA' }, 'text');
  const destructiveColor = useThemeColor({ light: '#EF4444', dark: '#F87171' }, 'text');

  useEffect(() => {
    const q = query(collection(db, 'employees'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const employeesFromDB: Employee[] = [];
      querySnapshot.forEach((doc: any) => {
        employeesFromDB.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setEmployees(employeesFromDB.sort((a, b) => a.firstName.localeCompare(b.firstName)));
    });

    return () => unsubscribe();
  }, []);

  const handleNewEmployee = () => {
    router.push('/settings/employees/form');
  };

  const handleEditEmployee = (employeeId: string) => {
    router.push({
      pathname: '/settings/employees/form',
      params: { employeeId },
    });
  };

  const handleDeleteEmployee = (employeeId: string, employeeName: string) => {
    Alert.alert(
      'Supprimer l\'employé',
      `Êtes-vous sûr de vouloir supprimer ${employeeName} ?`,
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteDoc(doc(db, 'employees', employeeId));
              Alert.alert('Succès', 'Employé supprimé');
            } catch (error) {
              console.error('Error deleting employee:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'employé');
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const getPermissionBadges = (employee: Employee) => {
    const permissions = [];
    if (employee.permissions.canManageProducts) permissions.push('Produits');
    if (employee.permissions.canManageEmployees) permissions.push('Employés');
    if (employee.permissions.canManageChalets) permissions.push('Chalets');
    if (employee.permissions.canViewOrders) permissions.push('Commandes');
    if (employee.permissions.canManageActivities) permissions.push('Activités');
    return permissions;
  };

  const renderNewEmployeeButton = () => (
    <TouchableOpacity 
      style={[styles.newEmployeeButton, { borderColor: accentColor }]} 
      onPress={handleNewEmployee}
      disabled={isLoading}
    >
      <ThemedText style={[styles.newEmployeeButtonText, { color: accentColor }]}>+ Nouvel employé</ThemedText>
    </TouchableOpacity>
  );

  const renderEmployeeItem = ({ item }: { item: Employee }) => {
    const permissions = getPermissionBadges(item);
    
    return (
      <TouchableOpacity 
        style={[styles.employeeCard, { backgroundColor: cardBackground, borderColor: cardBorder }]}
        onPress={() => handleEditEmployee(item.id)}
        disabled={isLoading}
      >
        <ThemedView style={styles.employeeContent}>
          <View style={styles.nameContainer}>
            <ThemedText style={styles.employeeName}>{item.firstName} {item.lastName}</ThemedText>
            <View style={[
              styles.statusBadge,
              { backgroundColor: item.isActive ? '#10B981' : '#6B7280' }
            ]}>
              <ThemedText style={styles.statusBadgeText}>
                {item.isActive ? 'Actif' : 'Inactif'}
              </ThemedText>
            </View>
          </View>
          
          <ThemedText style={[styles.employeeEmail, { color: subtleText }]}>
            {item.email}
          </ThemedText>
          
          {item.phone && (
            <ThemedText style={[styles.employeePhone, { color: subtleText }]}>
              {item.phone}
            </ThemedText>
          )}

          <ThemedText style={[styles.employeeRole, { color: subtleText }]}>
            {item.role}
          </ThemedText>

          {permissions.length > 0 && (
            <View style={styles.permissionsContainer}>
              {permissions.map((permission, index) => (
                <View key={index} style={styles.permissionBadge}>
                  <ThemedText style={styles.permissionBadgeText}>{permission}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </ThemedView>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteEmployee(item.id, `${item.firstName} ${item.lastName}`)}
          disabled={isLoading}
        >
          <ThemedText style={[styles.deleteButtonText, { color: destructiveColor }]}>✕</ThemedText>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <ThemedText style={styles.emptyText}>Aucun employé</ThemedText>
      <ThemedText style={[styles.emptySubtext, { color: subtleText }]}>
        Appuyez sur "Nouvel employé" pour en créer un
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={employees}
        renderItem={renderEmployeeItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            <ThemedText type="title" style={styles.title}>Employés</ThemedText>
            {renderNewEmployeeButton()}
          </>
        }
        ListEmptyComponent={renderEmptyList}
        contentContainerStyle={styles.listContent}
        scrollEnabled={true}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    marginBottom: 16,
  },
  newEmployeeButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  newEmployeeButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  employeeCard: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  employeeContent: {
    flex: 1,
    gap: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  employeeEmail: {
    fontSize: 13,
  },
  employeePhone: {
    fontSize: 13,
  },
  employeeRole: {
    fontSize: 13,
    fontWeight: '500',
  },
  permissionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  permissionBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  permissionBadgeText: {
    fontSize: 11,
    color: '#3B82F6',
    fontWeight: '500',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
  },
});
