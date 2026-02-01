import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Chalet } from '@/types/types';
import { collection, doc, getFirestore, onSnapshot, query, updateDoc } from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChaletsScreen() {
  const router = useRouter();
  const db = getFirestore();

  const [chalets, setChalets] = useState<Chalet[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedChalet, setSelectedChalet] = useState<Chalet | null>(null);
  const [clientId, setClientId] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'chalets'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const chaletsFromDB: Chalet[] = [];
      querySnapshot.forEach((doc: any) => {
        chaletsFromDB.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      // Sort by chalet number (id)
      chaletsFromDB.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      setChalets(chaletsFromDB);
    });

    return () => unsubscribe();
  }, []);

  const handleChaletPress = (chalet: Chalet) => {
    if (!chalet.booked) {
      // Show modal to assign client ID
      setSelectedChalet(chalet);
      setClientId('');
      setModalVisible(true);
    } else {
      // Navigate to consumption screen
      router.push({
        pathname: '/settings/chalets/consumption',
        params: { 
          chaletId: chalet.id,
          clientId: chalet.clientId || ''
        },
      });
    }
  };

  const handleAssignClient = async () => {
    if (!selectedChalet || !clientId.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un identifiant client');
      return;
    }

    try {
      const chaletRef = doc(db, 'chalets', selectedChalet.id);
      await updateDoc(chaletRef, {
        booked: true,
        clientId: clientId.trim(),
      });
      
      setModalVisible(false);
      setSelectedChalet(null);
      setClientId('');
    } catch (error) {
      console.error('Error assigning client:', error);
      Alert.alert('Erreur', 'Impossible d\'assigner le client');
    }
  };

  const renderChaletItem = ({ item }: { item: Chalet }) => (
    <TouchableOpacity
      style={styles.chaletItem}
      onPress={() => handleChaletPress(item)}
    >
      <ThemedView style={styles.chaletContent}>
        <ThemedText style={styles.chaletNumber}>Chalet {item.id}</ThemedText>
        <ThemedText
          style={[
            styles.chaletStatus,
            !item.booked ? styles.statusAvailable : styles.statusBooked
          ]}
        >
          {!item.booked ? 'disponible' : 'occupé'}
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={chalets}
        renderItem={renderChaletItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />

      {/* Modal for client ID input */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setSelectedChalet(null);
          setClientId('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              Assigner un client au Chalet {selectedChalet?.id}
            </ThemedText>
            
            <TextInput
              style={styles.input}
              placeholder="Identifiant unique du client"
              value={clientId}
              onChangeText={setClientId}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setSelectedChalet(null);
                  setClientId('');
                }}
              >
                <ThemedText style={styles.cancelButtonText}>Annuler</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={handleAssignClient}
              >
                <ThemedText style={styles.confirmButtonText}>Confirmer</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  listContent: {
    padding: 16,
  },
  chaletItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  chaletContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  chaletNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chaletStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusAvailable: {
    color: '#4CAF50',
  },
  statusBooked: {
    color: '#F44336',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
