import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Employee, EmployeePermissions } from '@/types/types';
import { collection, doc, getFirestore, onSnapshot, serverTimestamp, setDoc } from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const DEFAULT_PERMISSIONS: EmployeePermissions = {
  canManageProducts: false,
  canManageEmployees: false,
  canManageChalets: false,
  canViewOrders: false,
  canManageActivities: false,
};

export default function EmployeeFormScreen() {
  const router = useRouter();
  const db = getFirestore();
  const { employeeId } = useLocalSearchParams<{ employeeId?: string }>();

  const [isLoading, setIsLoading] = useState(!!employeeId);
  const [isSaving, setIsSaving] = useState(false);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [permissions, setPermissions] = useState<EmployeePermissions>(DEFAULT_PERMISSIONS);

  const cardBackground = useThemeColor({ light: '#F8FAFC', dark: '#1E2428' }, 'background');
  const cardBorder = useThemeColor({ light: '#E5E7EB', dark: '#2B3136' }, 'background');
  const inputBackground = useThemeColor({ light: '#FFFFFF', dark: '#252B30' }, 'background');
  const subtleText = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  const accentColor = useThemeColor({ light: '#3B82F6', dark: '#60A5FA' }, 'text');

  // Load employee data if editing
  useEffect(() => {
    if (!employeeId) {
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, 'employees', employeeId);
    const unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as Employee;
        setFirstName(data.firstName);
        setLastName(data.lastName);
        setEmail(data.email);
        setPhone(data.phone || '');
        setRole(data.role);
        setIsActive(data.isActive);
        setPermissions(data.permissions);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [employeeId]);

  const validateForm = (): boolean => {
    if (!firstName.trim()) {
      Alert.alert('Erreur', 'Le prénom est obligatoire');
      return false;
    }
    if (!lastName.trim()) {
      Alert.alert('Erreur', 'Le nom est obligatoire');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('Erreur', 'L\'email est obligatoire');
      return false;
    }
    if (!email.includes('@')) {
      Alert.alert('Erreur', 'L\'email n\'est pas valide');
      return false;
    }
    if (!role.trim()) {
      Alert.alert('Erreur', 'Le poste est obligatoire');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      
      const employeeData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        role: role.trim(),
        isActive,
        permissions,
        updatedAt: serverTimestamp(),
        ...(employeeId ? {} : { createdAt: serverTimestamp() }),
      };

      if (employeeId) {
        await setDoc(doc(db, 'employees', employeeId), employeeData, { merge: true });
        Alert.alert('Succès', 'Employé mis à jour');
      } else {
        // Generate a document ID for new employee
        const newDocRef = doc(collection(db, 'employees'));
        await setDoc(newDocRef, employeeData);
        Alert.alert('Succès', 'Employé créé');
      }

      router.back();
    } catch (error) {
      console.error('Error saving employee:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'employé');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePermission = (key: keyof EmployeePermissions, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleAllPermissions = () => {
    const allEnabled = Object.values(permissions).every(p => p);
    const newPermissions: EmployeePermissions = {
      canManageProducts: !allEnabled,
      canManageEmployees: !allEnabled,
      canManageChalets: !allEnabled,
      canViewOrders: !allEnabled,
      canManageActivities: !allEnabled,
    };
    setPermissions(newPermissions);
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accentColor} />
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Personal Information Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Informations personnelles</ThemedText>
          
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Prénom *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, borderColor: cardBorder }]}
              placeholder="Prénom"
              placeholderTextColor={subtleText}
              value={firstName}
              onChangeText={setFirstName}
              editable={!isSaving}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Nom *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, borderColor: cardBorder }]}
              placeholder="Nom"
              placeholderTextColor={subtleText}
              value={lastName}
              onChangeText={setLastName}
              editable={!isSaving}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Email *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, borderColor: cardBorder }]}
              placeholder="email@example.com"
              placeholderTextColor={subtleText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isSaving}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Téléphone</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, borderColor: cardBorder }]}
              placeholder="+33 6 12 34 56 78"
              placeholderTextColor={subtleText}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!isSaving}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Poste *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackground, borderColor: cardBorder }]}
              placeholder="e.g. Chef de service, Serveur"
              placeholderTextColor={subtleText}
              value={role}
              onChangeText={setRole}
              editable={!isSaving}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.switchContainer}>
              <ThemedText style={styles.label}>Actif</ThemedText>
              <Switch
                value={isActive}
                onValueChange={setIsActive}
                disabled={isSaving}
              />
            </View>
          </View>
        </ThemedView>

        {/* Permissions Section */}
        <ThemedView style={styles.section}>
          <View style={styles.permissionsHeader}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Permissions</ThemedText>
            <TouchableOpacity 
              style={styles.toggleAllButton}
              onPress={toggleAllPermissions}
              disabled={isSaving}
            >
              <ThemedText style={[styles.toggleAllText, { color: accentColor }]}>
                {Object.values(permissions).every(p => p) ? 'Tout désactiver' : 'Tout activer'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ThemedText style={[styles.permissionSubtext, { color: subtleText }]}>
            Sélectionnez les fonctionnalités auxquelles cet employé a accès
          </ThemedText>

          <View style={styles.permissionsList}>
            <View style={[styles.permissionItem, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
              <View style={styles.permissionInfo}>
                <ThemedText style={styles.permissionLabel}>Gérer les produits</ThemedText>
                <ThemedText style={[styles.permissionDescription, { color: subtleText }]}>
                  Ajouter, modifier et supprimer les produits
                </ThemedText>
              </View>
              <Switch
                value={permissions.canManageProducts}
                onValueChange={(value) => updatePermission('canManageProducts', value)}
                disabled={isSaving}
              />
            </View>

            <View style={[styles.permissionItem, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
              <View style={styles.permissionInfo}>
                <ThemedText style={styles.permissionLabel}>Gérer les employés</ThemedText>
                <ThemedText style={[styles.permissionDescription, { color: subtleText }]}>
                  Ajouter, modifier et supprimer les employés
                </ThemedText>
              </View>
              <Switch
                value={permissions.canManageEmployees}
                onValueChange={(value) => updatePermission('canManageEmployees', value)}
                disabled={isSaving}
              />
            </View>

            <View style={[styles.permissionItem, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
              <View style={styles.permissionInfo}>
                <ThemedText style={styles.permissionLabel}>Gérer les chalets</ThemedText>
                <ThemedText style={[styles.permissionDescription, { color: subtleText }]}>
                  Ajouter, modifier et supprimer les chalets
                </ThemedText>
              </View>
              <Switch
                value={permissions.canManageChalets}
                onValueChange={(value) => updatePermission('canManageChalets', value)}
                disabled={isSaving}
              />
            </View>

            <View style={[styles.permissionItem, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
              <View style={styles.permissionInfo}>
                <ThemedText style={styles.permissionLabel}>Consulter les commandes</ThemedText>
                <ThemedText style={[styles.permissionDescription, { color: subtleText }]}>
                  Accès en lecture aux commandes et historique
                </ThemedText>
              </View>
              <Switch
                value={permissions.canViewOrders}
                onValueChange={(value) => updatePermission('canViewOrders', value)}
                disabled={isSaving}
              />
            </View>

            <View style={[styles.permissionItem, { backgroundColor: cardBackground, borderColor: cardBorder }]}>
              <View style={styles.permissionInfo}>
                <ThemedText style={styles.permissionLabel}>Gérer les activités</ThemedText>
                <ThemedText style={[styles.permissionDescription, { color: subtleText }]}>
                  Modifier les activités disponibles
                </ThemedText>
              </View>
              <Switch
                value={permissions.canManageActivities}
                onValueChange={(value) => updatePermission('canManageActivities', value)}
                disabled={isSaving}
              />
            </View>
          </View>
        </ThemedView>

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: accentColor, opacity: isSaving ? 0.6 : 1 }]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <ThemedText style={styles.saveButtonText}>
                {employeeId ? 'Mettre à jour' : 'Créer l\'employé'}
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: cardBorder }]}
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <ThemedText style={[styles.cancelButtonText, { color: subtleText }]}>
              Annuler
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  permissionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  toggleAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  permissionSubtext: {
    fontSize: 13,
    marginBottom: 12,
  },
  permissionsList: {
    gap: 12,
  },
  permissionItem: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  permissionInfo: {
    flex: 1,
    gap: 4,
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  permissionDescription: {
    fontSize: 12,
  },
  buttonGroup: {
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
