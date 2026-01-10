import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OrderFromDB } from '@/types/types';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, Timestamp, where } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';


export default function SnackHistory() {

  const [allOrders, setAllOrders] = useState<OrderFromDB[]>([]);
  const db = getFirestore();
  
  useEffect(() => {
        
    const q = query(collection(db, 'orders'), where('service', '==', 'snack'), orderBy('createdAt', 'desc'));

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
  }, []);


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

  // Render each item
  const renderItem = ({ item }: { item: OrderFromDB }) => (
    <ThemedView style={styles.itemContainer}>
      <ThemedText style={styles.name}>{item.chalet}</ThemedText>
      <ThemedText style={styles.date}>{formatDate(item.createdAt)}</ThemedText>

      {Object.entries(item.order).map(([name, quantity]) => {
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

      <TouchableOpacity style={styles.cancelButton} onPress={() => handleDelete(item.id)}>
        <ThemedText style={styles.buttonText}>Annuler la commande</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );

  return (
    <FlatList
      data={allOrders}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
    />
  );
};

// Styles for the component
const styles = StyleSheet.create({
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  foodName: {
    fontSize: 16,
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

	