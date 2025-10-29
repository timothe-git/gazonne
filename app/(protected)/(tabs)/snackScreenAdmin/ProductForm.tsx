import { addDoc, collection, getFirestore } from '@react-native-firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const ProductForm: React.FC = () => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [service, setService] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const db = getFirestore();

  const handleSubmit = () => {
    if (!productName || !category || !description || !price || !service) {
      Alert.alert('Erreur', 'Complétez tous les champs.');
      return;
    }
    createProduct();
    Alert.alert('Succès', 'Produit ajouté!');
    setProductName('');
    setCategory('');
    setDescription('');
    setPrice('');
    setService('');
  };

  const createProduct = async () => {
        const productToSend = {
          name: productName,
          category: category,
          description: description,
          price: price,
          service: service
        };
      
        try {
          const docRef = await addDoc(collection(db, "products"), productToSend);
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          console.error("Error adding document: ", e);
        }
      }

  const services = [
    { label: 'petit-déj', value: 'petit-déj' },
    { label: 'snack', value: 'snack' },
    { label: 'bar', value: 'bar' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add a New Product</Text>
      <TextInput
        style={styles.input}
        placeholder="Nom du produit"
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Catégorie"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        style={[styles.input, styles.descriptionInput]}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <TextInput
        style={styles.input}
        placeholder="Prix (€)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      <TouchableOpacity style={styles.serviceButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.serviceButtonText}>
          {service ? `Service sélectionné: ${service}` : 'Sélectionnez un service'}
        </Text>
      </TouchableOpacity>

      <Button title="Submit" onPress={handleSubmit} color="#4CAF50" />

      {/* Modal for Service Selection */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez un service</Text>
            {services.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.serviceOption}
                onPress={() => {
                  setService(item.label);
                  setModalVisible(false);
                }}
              >
                <Text style={styles.serviceOptionText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  descriptionInput: {
    minHeight: 100,
    maxHeight: 200,
  },
  serviceButton: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  serviceButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
	modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  serviceOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  serviceOptionText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ProductForm;
