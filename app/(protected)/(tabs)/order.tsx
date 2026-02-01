import ServiceSelector from '@/components/ServiceSelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Chalet, MenuCategory, MenuProduct, OrderItemWithInstances, ProductFromDB } from '@/types/types';
import { addDoc, collection, doc, getFirestore, onSnapshot, query, serverTimestamp, updateDoc, where } from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


export default function OrderScreen() {

    const [order, setOrder] = useState<{ [productName: string]: OrderItemWithInstances }>({});
		const [chalet, setChalet] = useState<string>("");
    const [selectedService, setSelectedService] = useState<string>("Snack");
    const [menuData, setMenuData] = useState<MenuCategory[]>([]);
    const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<MenuProduct | null>(null);
    const [tempExtras, setTempExtras] = useState<{ [extraName: string]: number }>({});
    const [chaletModalVisible, setChaletModalVisible] = useState(false);
    const [isEditingOrder, setIsEditingOrder] = useState(false);
    const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
    const [bookedChalets, setBookedChalets] = useState<Chalet[]>([]);

  
    const db = getFirestore();
    const router = useRouter();
    const params = useLocalSearchParams();

    // Load editing order if present
    useEffect(() => {
      if (params.editOrder) {
        try {
          const editOrder = JSON.parse(params.editOrder as string);
          setEditingOrderId(editOrder.id);
          setChalet(editOrder.chalet);
          setSelectedService(editOrder.service || 'Snack');
          setOrder(editOrder.order);
          setIsEditingOrder(true);
        } catch (e) {
          console.error('Error parsing edit order:', e);
        }
      }
    }, [params.editOrder]);

    useEffect(() => {
        
      const q = query(collection(db, 'products'), where('services', 'array-contains', selectedService));
    
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const productsFromDB: ProductFromDB[] = [];
          querySnapshot.forEach((doc: any) => {
              productsFromDB.push({
                id: doc.id,
                ...doc.data(),
              });
          });
          const categoriesMap: { [key: string]: MenuCategory } = {};

          productsFromDB.forEach(product => {
            // Check if the category already exists in the map
            if (!categoriesMap[product.category]) {
              // If not, create a new MenuCategory
              categoriesMap[product.category] = {
                category: product.category,
                products: []
              };
            }

            // Create a MenuProduct from the ProductFromDB
            const menuProduct: MenuProduct = {
              id: product.id,
              name: product.name,
              priceString: `${product.price}€`,
              price: product.price,
              description: product.description,
              extras: product.extras || undefined
            };

            // Add the MenuProduct to the corresponding MenuCategory
            categoriesMap[product.category].products.push(menuProduct);
          });

          // Convert the map to an array of MenuCategory
          setMenuData(Object.values(categoriesMap));
        });
    
        return () => unsubscribe();
      }, [selectedService]);

    useEffect(() => {
      const q = query(collection(db, 'chalets'), where('booked', '==', true));

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const chaletsFromDB: Chalet[] = [];
        querySnapshot.forEach((doc: any) => {
          chaletsFromDB.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        chaletsFromDB.sort((a, b) => parseInt(a.id) - parseInt(b.id));
        setBookedChalets(chaletsFromDB);
      });

      return () => unsubscribe();
    }, []);

    useEffect(() => {
      if (!chalet) return;
      const stillBooked = bookedChalets.some((item) => item.id === chalet);
      if (!stillBooked) {
        setChalet("");
      }
    }, [bookedChalets, chalet]);
  
    // Generate unique ID for each item instance
    const generateInstanceId = () => {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const handleIncrease = (product: MenuProduct) => {
      const hasExtras = product.extras && product.extras.length > 0;
      
      if (hasExtras) {
        // Show modal to customize extras for this instance
        setSelectedProduct(product);
        setTempExtras({});
        setModalVisible(true);
      } else {
        // Product without extras - add instance directly
        addInstance(product.name, {});
      }
    };

    const addInstance = (productName: string, extras: { [extraName: string]: number }) => {
      setOrder((prev) => {
        const currentOrder = prev[productName] || { instances: [] };
        const newInstance = {
          id: generateInstanceId(),
          extras: extras
        };
        
        return {
          ...prev,
          [productName]: {
            instances: [...currentOrder.instances, newInstance]
          }
        };
      });
    };

    const handleConfirmModal = () => {
      if (selectedProduct) {
        addInstance(selectedProduct.name, tempExtras);
        setModalVisible(false);
        setSelectedProduct(null);
        setTempExtras({});
      }
    };

    const handleRemoveInstance = (productName: string, instanceId: string) => {
      setOrder((prev) => {
        const currentOrder = prev[productName];
        if (!currentOrder) return prev;
        
        const newInstances = currentOrder.instances.filter(inst => inst.id !== instanceId);
        
        if (newInstances.length === 0) {
          // Remove product if no instances left
          const { [productName]: _, ...newState } = prev;
          return newState;
        }
        
        return {
          ...prev,
          [productName]: {
            instances: newInstances
          }
        };
      });
    };

    const handleModalExtraIncrease = (extraName: string) => {
      setTempExtras((prev) => ({
        ...prev,
        [extraName]: (prev[extraName] || 0) + 1
      }));
    };

    const handleModalExtraDecrease = (extraName: string) => {
      setTempExtras((prev) => {
        const currentQuantity = prev[extraName] || 0;
        if (currentQuantity > 1) {
          return { ...prev, [extraName]: currentQuantity - 1 };
        } else {
          const { [extraName]: _, ...newState } = prev;
          return newState;
        }
      });
    };
  
    const handleConfirmOrder = () => {
      if (!chalet) {
        Alert.alert('Chalet requis', 'Veuillez sélectionner un chalet avant de confirmer la commande.');
        return;
      }
      if (Object.keys(order).length === 0) {
        Alert.alert('Commande vide', 'Veuillez ajouter au moins un produit à la commande.');
        return;
      }
      setWaitingForConfirmation(true);
    };

    const finalizeOrder = async () => {
      const success = await createOrder();
      if (success) {
        resetOrder();
        setWaitingForConfirmation(false);
        setChaletModalVisible(false);
      }
    };

    const resetOrder = () => {
      setOrder({});
      setIsEditingOrder(false);
      setEditingOrderId(null);
      setChalet("");
    };

    const cancelOrder = () => {
      setWaitingForConfirmation(false);
    };
  

  
    const createOrder = async () => {
      if (isEditingOrder && editingOrderId) {
        // Update existing order
        const orderToSend = {
          order: order,
          "chalet": chalet,
          'service': selectedService,
          updatedAt: serverTimestamp(),
        };
        
        try {
          const docRef = doc(db, "orders", editingOrderId);
          await updateDoc(docRef, orderToSend);
          console.log("Document updated with ID: ", editingOrderId);
          return true;
        } catch (e) {
          console.error("Error updating document: ", e);
          return false;
        }
      } else {
        // Create new order
        const orderToSend = {
          order: order,
          "chalet": chalet,
          'service': selectedService,
          createdAt: serverTimestamp(),
        };
      
        try {
          const docRef = await addDoc(collection(db, "orders"), orderToSend);
          console.log("Document written with ID: ", docRef.id);
          return true;
        } catch (e) {
          console.error("Error adding document: ", e);
          return false;
        }
      }
    }

  
  const renderItem = ({ item }: { item: MenuProduct }) => {
    const orderItem = order[item.name];
    const instances = orderItem?.instances || [];
    const quantity = instances.length;

    return (
      <ThemedView style={styles.itemContainer}>
        <ThemedView style={styles.productHeader}>
          <ThemedText style={styles.foodName}>{item.name}</ThemedText>
          <TouchableOpacity style={styles.addButton} onPress={() => handleIncrease(item)}>
            <ThemedText style={styles.buttonText}>+ Ajouter</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {instances.length > 0 && (
          <ThemedView style={styles.instancesContainer}>
            {instances.map((instance, index) => (
              <ThemedView key={instance.id} style={styles.instanceItem}>
                <ThemedView style={styles.instanceHeader}>
                  <ThemedText style={styles.instanceNumber}>{item.name} #{index + 1}</ThemedText>
                  <TouchableOpacity 
                    style={styles.removeButton} 
                    onPress={() => handleRemoveInstance(item.name, instance.id)}
                  >
                    <ThemedText style={styles.removeButtonText}>✕</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
                {Object.keys(instance.extras).length > 0 && (
                  <ThemedView style={styles.instanceExtras}>
                    {Object.entries(instance.extras).map(([extraName, extraQuantity]) => (
                      extraQuantity > 0 && (
                        <ThemedText key={extraName} style={styles.instanceExtraText}>
                          • {extraName}{extraQuantity > 1 ? ` x${extraQuantity}` : ''}
                        </ThemedText>
                      )
                    ))}
                  </ThemedView>
                )}
                {Object.keys(instance.extras).length === 0 && item.extras && item.extras.length > 0 && (
                  <ThemedText style={styles.noExtrasText}>Aucun extra</ThemedText>
                )}
              </ThemedView>
            ))}
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  const renderCategory = ({ item }: { item: MenuCategory }) => (
    <ThemedView style={styles.categoryContainer}>
      <ThemedText style={styles.categoryTitle}>{item.category}</ThemedText>
      <FlatList
        data={item.products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </ThemedView>
  );


    return (
      <ThemedView style={styles.container}>
				
        {waitingForConfirmation ? (
          <ThemedView style={styles.container}>
            <ScrollView style={styles.confirmationScrollView}>
              <ThemedView style={styles.confirmationContainer}>
                <ThemedText style={styles.confirmationText}>La commande :</ThemedText>
                {Object.entries(order).map(([productName, orderItem]) => {
                  const instances = orderItem.instances || [];
                  
                  if (instances.length > 0) {
                    return instances.map((instance, index) => (
                      <ThemedView key={instance.id} style={styles.orderItemContainer}>
                        <ThemedView>
                          <ThemedText style={styles.foodName}>
                            {productName} #{index + 1}
                          </ThemedText>
                          {Object.keys(instance.extras).length > 0 ? (
                            Object.entries(instance.extras).map(([extraName, extraQuantity]) => {
                              if (extraQuantity > 0) {
                                return (
                                  <ThemedText key={extraName} style={styles.extraQuantity}>
                                    • {extraName}{extraQuantity > 1 ? ` x${extraQuantity}` : ''}
                                  </ThemedText>
                                );
                              }
                              return null;
                            })
                          ) : (
                            <ThemedText style={styles.extraQuantity}>Aucun extra</ThemedText>
                          )}
                        </ThemedView>
                      </ThemedView>
                    ));
                  }
                  return null;
                })}
              </ThemedView>
            </ScrollView>
            <TouchableOpacity style={styles.confirmButton} onPress={finalizeOrder}>
              <ThemedText style={styles.buttonText}>{isEditingOrder ? 'Mettre à jour' : 'Confirmer la commande'}</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={cancelOrder}>
              <ThemedText style={styles.buttonText}>{isEditingOrder ? 'Annuler' : 'Retour'}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.container}>
            <ServiceSelector 
              selectedService={selectedService}
              onServiceChange={(service) => {
                setSelectedService(service);
                if (!isEditingOrder) {
                  setOrder({});
                }
              }}
            />
            <FlatList
              data={menuData}
              renderItem={renderCategory}
              keyExtractor={(item) => item.category}
              contentContainerStyle={styles.listContainer}
            />
            <ThemedView style={styles.pickerContainer}>
              <ThemedText style={styles.labelInline}>Chalet :</ThemedText>
              <ThemedView style={styles.dropdownWrapper}>
                <TouchableOpacity 
                  style={[styles.chaletPicker, !chalet && styles.chaletPickerPlaceholder]}
                  onPress={() => setChaletModalVisible(!chaletModalVisible)}
                >
                  <ThemedText style={[styles.chaletPickerText, !chalet && styles.chaletPickerPlaceholderText]}>
                    {chalet ? `Chalet ${chalet}` : 'Sélectionnez un chalet'}
                  </ThemedText>
                  <ThemedText style={[styles.chaletPickerArrow, chaletModalVisible && styles.chaletPickerArrowOpen]}>
                    ▼
                  </ThemedText>
                </TouchableOpacity>
                
                {chaletModalVisible && (
                  <View style={styles.dropdownList}>
                    <FlatList
                      data={bookedChalets.map((item) => item.id)}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.chaletOption, chalet === item && styles.chaletOptionSelected]}
                          onPress={() => {
                            setChalet(item);
                            setChaletModalVisible(false);
                          }}
                        >
                          <ThemedText style={[styles.chaletOptionText, chalet === item && styles.chaletOptionTextSelected]}>
                            Chalet {item}
                          </ThemedText>
                          {chalet === item && (
                            <ThemedText style={styles.chaletCheckmark}>✓</ThemedText>
                          )}
                        </TouchableOpacity>
                      )}
                      keyExtractor={(item) => item}
                      style={styles.chaletOptionsList}
                      nestedScrollEnabled={true}
                    />
                  </View>
                )}
              </ThemedView>
            </ThemedView>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
              <ThemedText style={styles.buttonText}>{isEditingOrder ? 'Mettre à jour' : 'Confirmer la commande'}</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Modal for customizing extras */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
            setSelectedProduct(null);
            setTempExtras({});
          }}
        >
          <ThemedView style={styles.modalOverlay}>
            <ThemedView style={styles.modalContent}>
              <ThemedText style={styles.modalTitle}>
                Personnaliser {selectedProduct?.name}
              </ThemedText>
              
              {selectedProduct?.extras && selectedProduct.extras.length > 0 && (
                <ScrollView style={styles.modalExtrasList}>
                  {selectedProduct.extras.map((extra) => {
                    const quantity = tempExtras[extra.name] || 0;
                    return (
                      <ThemedView key={extra.name} style={styles.modalExtraItem}>
                        <ThemedText style={styles.modalExtraName}>{extra.name}</ThemedText>
                        <ThemedView style={styles.quantityContainer}>
                          <TouchableOpacity 
                            style={styles.quantityButton} 
                            onPress={() => handleModalExtraDecrease(extra.name)}
                          >
                            <ThemedText style={styles.buttonText}>-</ThemedText>
                          </TouchableOpacity>
                          <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
                          <TouchableOpacity 
                            style={styles.quantityButton} 
                            onPress={() => handleModalExtraIncrease(extra.name)}
                          >
                            <ThemedText style={styles.buttonText}>+</ThemedText>
                          </TouchableOpacity>
                        </ThemedView>
                      </ThemedView>
                    );
                  })}
                </ScrollView>
              )}
              
              <ThemedView style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.modalCancelButton} 
                  onPress={() => {
                    setModalVisible(false);
                    setSelectedProduct(null);
                    setTempExtras({});
                  }}
                >
                  <ThemedText style={styles.buttonText}>Annuler</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.modalConfirmButton} 
                  onPress={handleConfirmModal}
                >
                  <ThemedText style={styles.buttonText}>Ajouter</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </Modal>


      </ThemedView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f8f8f8',
    },
    flex: {
      flex: 1,
    },
    listContainer: {
      padding: 16,
    },
    itemContainer: {
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 16,
      marginVertical: 8,
      elevation: 2,
    },
    productHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    extrasContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    },
    extrasTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 8,
      color: '#666',
    },
    extraItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 4,
      paddingLeft: 12,
    },
    extraName: {
      fontSize: 15,
      color: '#555',
    },
    extraQuantity: {
      fontSize: 14,
      color: '#666',
      marginLeft: 8,
      marginTop: 2,
    },
    foodName: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    quantityButton: {
      backgroundColor: '#4CAF50',
      borderRadius: 5,
      paddingVertical: 5,
      paddingHorizontal: 10,
      marginHorizontal: 5,
    },
    quantityText: {
      fontSize: 16,
      marginHorizontal: 10,
    },
    confirmButton: {
      backgroundColor: '#2196F3',
      borderRadius: 5,
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginHorizontal: 16,
      marginVertical: 4,
      alignItems: 'center',
    },
    buttonText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    categoryContainer: {
    marginBottom: 20,
    backgroundColor: '#f8f8f8',
  },
  categoryTitle: {
    color: 'green',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
	label: {
    fontSize: 20,
    marginBottom: 10,
    color: '#343a40',
  },
  pickerContainer: {
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    zIndex: 1,
  },
  labelInline: {
    fontSize: 16,
    color: '#343a40',
    fontWeight: '500',
    minWidth: 70,
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 1000,
  },
  chaletPicker: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 1,
    minWidth: 180,
  },
  chaletPickerPlaceholder: {
    borderColor: '#bbb',
  },
  chaletPickerText: {
    fontSize: 16,
    color: '#343a40',
    flex: 1,
  },
  chaletPickerPlaceholderText: {
    color: '#999',
  },
  chaletPickerArrow: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    transform: [{ rotate: '0deg' }],
  },
  chaletPickerArrowOpen: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownList: {
    position: 'absolute',
    bottom: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 4,
    maxHeight: 300,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 1001,
  },
  chaletOptionsList: {
    maxHeight: 300,
  },
  chaletOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chaletOptionSelected: {
    backgroundColor: '#e3f2fd',
  },
  chaletOptionText: {
    fontSize: 16,
    color: '#333',
  },
  chaletOptionTextSelected: {
    color: '#1976d2',
    fontWeight: '600',
  },
  chaletCheckmark: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  customerContainer: {
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  orderListContainer: {
    paddingLeft: 16,
  },
  orderItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  foodQuantity: {
    fontSize: 16,
    color: '#555',
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmationContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 8,
    elevation: 2,
  },
  confirmationText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
    cancelButton: {
      backgroundColor: '#f44336',
      borderRadius: 5,
      paddingVertical: 10,
      paddingHorizontal: 20,
      marginHorizontal: 16,
      marginVertical: 4,
      alignItems: 'center',
    },
    addButton: {
      backgroundColor: '#4CAF50',
      borderRadius: 5,
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    instancesContainer: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
    },
    instanceItem: {
      backgroundColor: '#f5f5f5',
      borderRadius: 6,
      padding: 12,
      marginVertical: 6,
    },
    instanceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    instanceNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
    removeButton: {
      backgroundColor: '#f44336',
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeButtonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    instanceExtras: {
      marginTop: 4,
    },
    instanceExtraText: {
      fontSize: 14,
      color: '#666',
      marginTop: 2,
    },
    noExtrasText: {
      fontSize: 14,
      color: '#999',
      fontStyle: 'italic',
      marginTop: 4,
    },
    confirmationScrollView: {
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: '#fff',
      borderRadius: 20,
      padding: 24,
      width: '85%',
      maxHeight: '70%',
      elevation: 5,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 16,
      textAlign: 'center',
    },
    modalExtrasList: {
      maxHeight: 300,
      marginBottom: 16,
    },
    modalExtraItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    modalExtraName: {
      fontSize: 16,
      color: '#333',
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    modalCancelButton: {
      backgroundColor: '#f44336',
      borderRadius: 5,
      paddingVertical: 10,
      paddingHorizontal: 20,
      flex: 0.48,
      alignItems: 'center',
    },
    modalConfirmButton: {
      backgroundColor: '#4CAF50',
      borderRadius: 5,
      paddingVertical: 10,
      paddingHorizontal: 20,
      flex: 0.48,
      alignItems: 'center',
    },
  });
  