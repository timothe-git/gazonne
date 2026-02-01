import ServiceSelector from '@/components/ServiceSelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OrderFromDB, OrderItemWithInstances } from '@/types/types';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';


export default function SnackHistory() {

  const [allOrders, setAllOrders] = useState<OrderFromDB[]>([]);
  const [selectedService, setSelectedService] = useState<string>('Snack');
  const db = getFirestore();
  const router = useRouter();
  
  useEffect(() => {
        
    const q = query(collection(db, 'orders'), where('service', '==', selectedService), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersFromDB: OrderFromDB[] = [];

      querySnapshot.forEach((doc: any) => {
        ordersFromDB.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      setAllOrders(ordersFromDB);
    });

    return () => unsubscribe();
  }, [selectedService]);


  const handleDelete = (orderId: string) => {
    Alert.alert(
      "Supprimer la Commande",
      "Êtes-vous sûr de vouloir supprimer cette commande ?",
      [
        {
          text: "Annuler",
          style: "cancel"
        },
        {
          text: "Supprimer",
          onPress: () => deleteOrder(orderId),
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const docRef = doc(db, "orders", orderId);
      await deleteDoc(docRef);
      console.log("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };
	
	
  // Function to format the Firebase timestamp
  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) {return '';}
		return timestamp.toDate().toLocaleString();
  };

  const handleEditOrder = (order: OrderFromDB) => {
    router.push({
      pathname: '/(protected)/(tabs)/order',
      params: {
        editOrder: JSON.stringify(order),
        service: order.service,
      },
    });
  };

  // Render each item
  const renderItem = ({ item }: { item: OrderFromDB }) => (
    <TouchableOpacity style={styles.itemContainer} onPress={() => handleEditOrder(item)}>
      <ThemedText style={styles.name}>{item.chalet}</ThemedText>
      <ThemedText style={styles.date}>{formatDate(item.createdAt)}</ThemedText>

      {Object.entries(item.order).map(
        ([productName, productData]: [string, OrderItemWithInstances]) => {
          const instances = productData.instances ?? [];

          return (
            <ThemedView key={productName} style={styles.orderItemContainer}>
              {/* Product name and total quantity */}
              <ThemedText style={styles.foodName}>
                {productName} x {instances.length}
              </ThemedText>

              {/* Display each instance's extras or "sans suppléments" */}
              {instances.map((instance, index) => {
                const extras = instance.extras && Object.keys(instance.extras).length > 0
                  ? Object.entries(instance.extras)
                      .map(([name, qty]) => (qty > 1 ? `${name} x${qty}` : name))
                      .join(', ')
                  : 'sans suppléments';

                return (
                  <ThemedText key={instance.id} style={styles.extraText}>
                    {index + 1}. {extras}
                  </ThemedText>
                );
              })}
            </ThemedView>
          );
        }
      )}




      <TouchableOpacity style={styles.cancelButton} onPress={() => handleDelete(item.id)}>
        <ThemedText style={styles.buttonText}>Annuler la commande</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ServiceSelector 
        selectedService={selectedService}
        onServiceChange={setSelectedService}
      />
      <FlatList
        data={allOrders}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </ThemedView>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    padding: 12,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#666',
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
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  extrasContainer: {
    paddingLeft: 12,
    marginTop: 4,
  },
  extraText: {
    fontSize: 14,
    color: '#777',
  },
  foodQuantity: {
    fontSize: 16,
    color: '#555',
  },
  foodPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});


	