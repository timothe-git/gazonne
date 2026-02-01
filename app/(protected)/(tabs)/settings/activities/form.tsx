import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Activity } from '@/types/types';
import { addDoc, collection, doc, getDoc, getFirestore, updateDoc } from '@react-native-firebase/firestore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

const DAYS_OF_WEEK = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export default function ActivityFormScreen() {
  const router = useRouter();
  const { activityId } = useLocalSearchParams<{ activityId?: string }>();
  
  const [activityName, setActivityName] = useState('');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const db = getFirestore();
  const isEditMode = !!activityId;

  useEffect(() => {
    if (isEditMode && activityId) {
      loadActivity();
    }
  }, [activityId]);

  const loadActivity = async () => {
    try {
      setIsLoading(true);
      const docRef = doc(db, 'activities', activityId!);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as Activity;
        setActivityName(data.name);
        setDuration(data.duration);
        setLocation(data.location);
      }
    } catch (error) {
      console.error('Error loading activity:', error);
      Alert.alert('Erreur', 'Impossible de charger l\'activité');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!activityName.trim() || !duration.trim() || !location.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const activityData: Activity = {
        name: activityName.trim(),
        duration: duration.trim(),
        location: location.trim(),
      };

      if (isEditMode && activityId) {
        await updateDoc(doc(db, 'activities', activityId), activityData);
        Alert.alert('Succès', 'Activité modifiée avec succès!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await addDoc(collection(db, 'activities'), activityData);
        Alert.alert('Succès', 'Activité créée avec succès!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error saving activity:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'activité');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDay = (day: string) => {
    setLocation(day);
    setModalVisible(false);
  };

  const buttonLabel = isEditMode ? 'Modifier l\'activité' : 'Créer une nouvelle activité';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: isEditMode ? 'Modifier l\'activité' : 'Ajouter une activité',
          animation: "none",
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={styles.input}
          placeholder="Nom de l'activité"
          placeholderTextColor="#999"
          value={activityName}
          onChangeText={setActivityName}
          editable={!isLoading}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Durée (ex: 1h30)"
          placeholderTextColor="#999"
          value={duration}
          onChangeText={setDuration}
          editable={!isLoading}
        />

        <TouchableOpacity 
          style={[styles.dayButton, isLoading && styles.disabled]} 
          onPress={() => setModalVisible(true)}
          disabled={isLoading}
        >
          <ThemedText style={styles.dayButtonText}>
            {location ? `Jour: ${location}` : 'Sélectionnez un jour'}
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.submitButton, isLoading && styles.disabled]} 
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <ThemedText style={styles.submitButtonText}>
            {isLoading ? 'Chargement...' : buttonLabel}
          </ThemedText>
        </TouchableOpacity>

        {isEditMode && (
          <TouchableOpacity 
            style={[styles.cancelButton, isLoading && styles.disabled]} 
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Modal for Day Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Sélectionnez un jour</ThemedText>
            {DAYS_OF_WEEK.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayOption,
                  location === day && styles.dayOptionSelected
                ]}
                onPress={() => handleSelectDay(day)}
              >
                <ThemedText style={[
                  styles.dayOptionText,
                  location === day && styles.dayOptionTextSelected
                ]}>
                  {day}
                </ThemedText>
                {location === day && (
                  <ThemedText style={styles.dayCheckmark}>✓</ThemedText>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setModalVisible(false)}
            >
              <ThemedText style={styles.closeModalText}>Fermer</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  dayButton: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  dayButtonText: {
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  cancelButton: {
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  disabled: {
    opacity: 0.6,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  dayOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  dayOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  dayOptionText: {
    fontSize: 16,
  },
  dayOptionTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  dayCheckmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  closeModalButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  closeModalText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
