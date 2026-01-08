import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MenuCategory, MenuProduct, ProductFromDB } from '@/types/types';
import { addDoc, collection, getFirestore, onSnapshot, query, serverTimestamp } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';


export default function SnackScreenAdmin() {

    const [order, setOrder] = useState<{ [key: string]: number }>({});
		const [chalet, setChalet] = useState("-1");
    const [menuData, setMenuData] = useState<MenuCategory[]>([]);
    const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);

  
    const db = getFirestore();


    useEffect(() => {
        
        const q = query(collection(db, 'products'));
    
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
              description: product.description
            };

            // Add the MenuProduct to the corresponding MenuCategory
            categoriesMap[product.category].products.push(menuProduct);
          });

          // Convert the map to an array of MenuCategory
          setMenuData(Object.values(categoriesMap));
        });
    
        return () => unsubscribe();
      }, []);
  
  
    const handleIncrease = (name: string) => {
      setOrder((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
    };
  
    const handleDecrease = (name: string) => {
      setOrder((prev) => {
        const currentCount = prev[name] || 0;
        if (currentCount > 1) {
            return { ...prev, [name]: currentCount - 1 };
        } else {  // We do not ant to keep items with 0 quantity
            const { [name]: _, ...newState } = prev;
            return newState;
        }
    });
    };
  
    const handleConfirmOrder = () => {
      setWaitingForConfirmation(true);
    };

    const finalizeOrder = () => {
      createOrder();
      setOrder({});
      setWaitingForConfirmation(false);
    };
  

  
    const createOrder = async () => {
      const orderToSend = {
				order: order,
				"chalet": chalet,
				'service': 'snack',
				createdAt: serverTimestamp(),
			};
    
      try {
        const docRef = await addDoc(collection(db, "orders"), orderToSend);
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        console.error("Error adding document: ", e);
      }
    }

  
  const renderItem = ({ item }: { item: MenuProduct }) => {
    const quantity = order[item.name] || 0;

    return (
      <ThemedView style={styles.itemContainer}>
        <ThemedText style={styles.foodName}>{item.name}</ThemedText>
        <ThemedView style={styles.quantityContainer}>
          <TouchableOpacity style={styles.quantityButton} onPress={() => handleDecrease(item.name)}>
            <ThemedText style={styles.buttonText}>-</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
          <TouchableOpacity style={styles.quantityButton} onPress={() => handleIncrease(item.name)}>
            <ThemedText style={styles.buttonText}>+</ThemedText>
          </TouchableOpacity>
        </ThemedView>
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
            <ThemedView style={styles.confirmationContainer}>
            <ThemedText style={styles.confirmationText}>La commande :</ThemedText>
            {Object.entries(order).map(([name, quantity]) => {
              if (quantity > 0) {
                return (
                  <ThemedView key={name} style={styles.orderItemContainer}>
                    <ThemedText style={styles.foodName}>{name}</ThemedText>
                    <ThemedText style={styles.foodQuantity}>x {quantity}</ThemedText>
                  </ThemedView>
                );
              }
              return null;
            })}
            </ThemedView>
            <TouchableOpacity style={styles.confirmButton} onPress={finalizeOrder}>
              <ThemedText style={styles.buttonText}>Confirmer la commande</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setWaitingForConfirmation(false)}>
              <ThemedText style={styles.buttonText}>Annuler</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ) : (
          <ThemedView style={styles.container}>
            <FlatList
              data={menuData}
              renderItem={renderCategory}
              keyExtractor={(item) => item.category}
              contentContainerStyle={styles.listContainer}
            />
            <ThemedView style={styles.pickerContainer}>
            <ThemedText style={styles.label}>Chalet :</ThemedText>
            <TextInput
              style={styles.picker}
              placeholder="Chalet"
              value={chalet}
              onChangeText={setChalet}
              autoCapitalize="none"
            />
            </ThemedView>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
              <ThemedText style={styles.buttonText}>Confirmer la commande</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}


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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#343a40',
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
  });
  