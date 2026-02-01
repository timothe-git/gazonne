import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProductExtra, ProductFromDB } from '@/types/types';
import { addDoc, collection, doc, getDoc, getFirestore, updateDoc } from '@react-native-firebase/firestore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function ProductFormScreen() {
  const router = useRouter();
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [extraModalVisible, setExtraModalVisible] = useState(false);
  const [editingExtraIndex, setEditingExtraIndex] = useState<number | null>(null);
  const [extraName, setExtraName] = useState('');
  const [extraPrice, setExtraPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const db = getFirestore();
  const isEditMode = !!productId;

  const services = [
    { label: 'petit-déj', value: 'petit-déj' },
    { label: 'snack', value: 'snack' },
    { label: 'bar', value: 'bar' },
  ];

  useEffect(() => {
    if (isEditMode && productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setIsLoading(true);
      const docRef = doc(db, 'products', productId!);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as ProductFromDB;
        setProductName(data.name);
        setCategory(data.category);
        setDescription(data.description);
        setPrice(data.price.toString());
        setSelectedServices(data.services || []);
        setExtras(data.extras || []);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      Alert.alert('Erreur', 'Impossible de charger le produit');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!productName.trim() || !category.trim() || !price.trim() || selectedServices.length === 0) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs et sélectionner au moins un service.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const productData: any = {
        name: productName.trim(),
        category: category.trim(),
        description: description.trim(),
        price: parseFloat(price),
        services: selectedServices,
      };

      // Only add extras if there are any
      if (extras.length > 0) {
        productData.extras = extras;
      }

      if (isEditMode && productId) {
        await updateDoc(doc(db, 'products', productId), productData);
        Alert.alert('Succès', 'Produit modifié avec succès!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        await addDoc(collection(db, 'products'), productData);
        Alert.alert('Succès', 'Produit créé avec succès!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le produit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddExtra = () => {
    setEditingExtraIndex(null);
    setExtraName('');
    setExtraPrice('');
    setExtraModalVisible(true);
  };

  const handleEditExtra = (index: number) => {
    setEditingExtraIndex(index);
    setExtraName(extras[index].name);
    setExtraPrice(extras[index].price.toString());
    setExtraModalVisible(true);
  };

  const handleSaveExtra = () => {
    if (!extraName.trim() || !extraPrice.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs de l\'extra.');
      return;
    }

    const newExtra: ProductExtra = {
      name: extraName.trim(),
      price: parseFloat(extraPrice),
    };

    if (editingExtraIndex !== null) {
      // Edit existing extra
      const updatedExtras = [...extras];
      updatedExtras[editingExtraIndex] = newExtra;
      setExtras(updatedExtras);
    } else {
      // Add new extra
      setExtras([...extras, newExtra]);
    }

    setExtraModalVisible(false);
    setExtraName('');
    setExtraPrice('');
    setEditingExtraIndex(null);
  };

  const toggleService = (serviceValue: string) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceValue)) {
        return prev.filter(s => s !== serviceValue);
      } else {
        return [...prev, serviceValue];
      }
    });
  };

  const handleDeleteExtra = (index: number) => {
    Alert.alert(
      'Supprimer l\'extra',
      `Êtes-vous sûr de vouloir supprimer "${extras[index].name}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: () => {
            const updatedExtras = extras.filter((_, i) => i !== index);
            setExtras(updatedExtras);
          },
          style: 'destructive',
        },
      ]
    );
  };

  const buttonLabel = isEditMode ? 'Modifier le produit' : 'Créer un nouveau produit';

  return (
    <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: isEditMode ? 'Modifier le produit' : 'Ajouter un produit',
            animation: "none",
            headerShown: true,
          }}
        />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={styles.input}
          placeholder="Nom du produit"
          placeholderTextColor="#999"
          value={productName}
          onChangeText={setProductName}
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Catégorie"
          placeholderTextColor="#999"
          value={category}
          onChangeText={setCategory}
          editable={!isLoading}
        />
        <TextInput
          style={[styles.input, styles.descriptionInput]}
          placeholder="Description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Prix (€)"
          placeholderTextColor="#999"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[styles.serviceButton, isLoading && styles.disabled]} 
          onPress={() => setModalVisible(true)}
          disabled={isLoading}
        >
          <ThemedText style={styles.serviceButtonText}>
            {selectedServices.length > 0 ? `Services: ${selectedServices.join(', ')}` : 'Sélectionnez un ou plusieurs services'}
          </ThemedText>
        </TouchableOpacity>

        {/* Extras Section */}
        <ThemedView style={styles.extrasSection}>
          <ThemedView style={styles.extrasSectionHeader}>
            <ThemedText style={styles.extrasSectionTitle}>Extras (optionnel)</ThemedText>
            <TouchableOpacity 
              style={[styles.addExtraButton, isLoading && styles.disabled]}
              onPress={handleAddExtra}
              disabled={isLoading}
            >
              <ThemedText style={styles.addExtraButtonText}>+ Ajouter un extra</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          {extras.length > 0 ? (
            <ThemedView style={styles.extrasList}>
              {extras.map((extra, index) => (
                <ThemedView key={index} style={styles.extraItem}>
                  <ThemedView style={styles.extraInfo}>
                    <ThemedText style={styles.extraNameText}>{extra.name}</ThemedText>
                    <ThemedText style={styles.extraPriceText}>{extra.price}€</ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.extraActions}>
                    <TouchableOpacity
                      style={styles.editExtraButton}
                      onPress={() => handleEditExtra(index)}
                      disabled={isLoading}
                    >
                      <ThemedText style={styles.editExtraButtonText}>✏️</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteExtraButton}
                      onPress={() => handleDeleteExtra(index)}
                      disabled={isLoading}
                    >
                      <ThemedText style={styles.deleteExtraButtonText}>✕</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              ))}
            </ThemedView>
          ) : (
            <ThemedText style={styles.noExtrasText}>Aucun extra ajouté</ThemedText>
          )}
        </ThemedView>

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

      {/* Modal for Service Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>Sélectionnez un ou plusieurs services</ThemedText>
            {services.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.serviceOption,
                  selectedServices.includes(item.value) && styles.serviceOptionSelected
                ]}
                onPress={() => toggleService(item.value)}
              >
                <ThemedText style={[
                  styles.serviceOptionText,
                  selectedServices.includes(item.value) && styles.serviceOptionTextSelected
                ]}>
                  {item.label}
                </ThemedText>
                {selectedServices.includes(item.value) && (
                  <ThemedText style={styles.serviceCheckmark}>✓</ThemedText>
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

      {/* Modal for Extra Add/Edit */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={extraModalVisible}
        onRequestClose={() => {
          setExtraModalVisible(false);
          setExtraName('');
          setExtraPrice('');
          setEditingExtraIndex(null);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>
              {editingExtraIndex !== null ? 'Modifier l\'extra' : 'Ajouter un extra'}
            </ThemedText>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nom de l'extra"
              placeholderTextColor="#999"
              value={extraName}
              onChangeText={setExtraName}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Prix (€)"
              placeholderTextColor="#999"
              value={extraPrice}
              onChangeText={setExtraPrice}
              keyboardType="decimal-pad"
            />

            <ThemedView style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={() => {
                  setExtraModalVisible(false);
                  setExtraName('');
                  setExtraPrice('');
                  setEditingExtraIndex(null);
                }}
              >
                <ThemedText style={styles.modalCancelButtonText}>Annuler</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSaveButton}
                onPress={handleSaveExtra}
              >
                <ThemedText style={styles.modalSaveButtonText}>
                  {editingExtraIndex !== null ? 'Modifier' : 'Ajouter'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
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
  descriptionInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingVertical: 10,
  },
  serviceButton: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  serviceButtonText: {
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
  serviceOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
  },
  serviceOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  serviceOptionText: {
    fontSize: 16,
  },
  serviceOptionTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  serviceCheckmark: {
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
  extrasSection: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  extrasSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  extrasSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addExtraButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addExtraButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  extrasList: {
    gap: 10,
  },
  extraItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  extraInfo: {
    flex: 1,
  },
  extraNameText: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  extraPriceText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  extraActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editExtraButton: {
    padding: 8,
  },
  editExtraButtonText: {
    fontSize: 18,
  },
  deleteExtraButton: {
    backgroundColor: '#f44336',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteExtraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noExtrasText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 10,
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalCancelButton: {
    flex: 0.48,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  modalSaveButton: {
    flex: 0.48,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
