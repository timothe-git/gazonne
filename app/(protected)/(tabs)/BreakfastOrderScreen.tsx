import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authContext } from '@/utils/AuthContext';
import { breakfastOrderContext } from '@/utils/BreakfastOrderContext';
import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, serverTimestamp, updateDoc } from '@react-native-firebase/firestore';
import { Link } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FoodItem {
  name: string;
  price: number;
}

const foodData: FoodItem[] = [
  { name: 'Pain', price: 2.50 },
  { name: 'Chocolatine', price: 1.50 },
  { name: 'Croissant', price: 1.50 },
];


export default function BreakfastOrderScreen() {

  const [order, setOrder] = useState<{ [key: string]: number }>({});
  const [isOrderConfirmed, setIsOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [isBeingModified, setIsBeingModified] = useState(false);

  const authState = useContext(authContext);

  const db = getFirestore();

  const breakfastOrderState = useContext(breakfastOrderContext);


  useEffect(() => {
    if (breakfastOrderState.orderId) {
      setOrderId(breakfastOrderState.orderId);
      retrieveOrder(breakfastOrderState.orderId);
    }
    }, []); // Empty dependency array means this runs once on mount


  const handleIncrease = (name: string) => {
    setOrder((prev) => ({ ...prev, [name]: (prev[name] || 0) + 1 }));
  };

  const handleDecrease = (name: string) => {
    setOrder((prev) => {
      const currentCount = prev[name] || 0;
      if (currentCount > 0) {
        return { ...prev, [name]: currentCount - 1 };
      }
      return prev;
    });
  };

  const handleConfirmOrder = () => {
    setIsOrderConfirmed(true);
    setIsBeingModified(false);
    if (isBeingModified) {
      updateOrder(orderId);
    }
    else {
      createOrder();
    }
  };

  const handleCancelOrder = () => {
    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler la commande ?',
      [
        {
          text: 'Non',
          style: 'cancel',
        },
        {
          text: 'Oui',
          onPress: () => {
            setOrder({});
            setIsOrderConfirmed(false);
            deleteOrder(orderId);
            setOrderId("");
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleModifyOrder = () => {
    Alert.alert(
      'Modifier la commande',
      'Êtes-vous sûr de vouloir modifier la commande ?',
      [
        {
          text: 'Non',
          style: 'cancel',
        },
        {
          text: 'Oui',
          onPress: () => {
            setIsOrderConfirmed(false);
            setIsBeingModified(true);
          },
        },
      ],
      { cancelable: false }
    );
  };

  const createOrder = async () => {
    const orderToSend = {
      order: order,
      "chalet": "28",
      "service": "petit-dej",
      createdAt: serverTimestamp(),
    }
  
    try {
      const docRef = await addDoc(collection(db, "orders"), orderToSend);
      setOrderId(docRef.id);
      breakfastOrderState.storeBreakfastOrder(docRef.id)
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  const retrieveOrder = async (orderId: string) => {
    try {
      const docRef = doc(db, "orders", orderId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
          setOrder(docSnap.data()?.order);
          setIsOrderConfirmed(true);
      } /*else {
          console.log("No such document!");
      }*/
  } catch (e) {
      console.error("Error retrieving document: ", e);
  }
  };

  const updateOrder = async (orderId: string) => {
    try {
      const docRef = doc(db, "orders", orderId);
      await updateDoc(docRef, {order: order});
      console.log("Document updated successfully");
  } catch (e) {
      console.error("Error updating document: ", e);
  }

  };

  const deleteOrder = async (orderId: string) => {
    try {
      const docRef = doc(db, "orders", orderId);
      await deleteDoc(docRef);
      console.log("Document deleted successfully");
  } catch (e) {
      console.error("Error deleting document: ", e);
  }

  };


  const renderItem = ({ item }: { item: FoodItem }) => {
    const quantity = order[item.name] || 0;

    return (
      <ThemedView style={styles.itemContainer}>
        <ThemedText style={styles.foodName}>{item.name}</ThemedText>
        <ThemedText style={styles.foodPrice}>€{item.price.toFixed(2)}</ThemedText>
        {isOrderConfirmed ? (
        <ThemedView></ThemedView>) : (
          <ThemedView style={styles.quantityContainer}>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleDecrease(item.name)}>
              <ThemedText style={styles.buttonText}>-</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.quantityText}>{quantity}</ThemedText>
            <TouchableOpacity style={styles.quantityButton} onPress={() => handleIncrease(item.name)}>
              <ThemedText style={styles.buttonText}>+</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  const totalOrder = Object.keys(order).reduce((total, name) => {
    const item = foodData.find((food) => food.name === name);
    return total + (item ? item.price * order[name] : 0);
  }, 0);

  if (!authState.isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>
            Un compte est nécessaire
          </Text>

          <Text style={styles.message}>
            Un compte est nécessaire pour passer une commande de petit-déjeuner.
          </Text>

          <Link href="/login" replace asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    );
  }


  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={foodData}
        renderItem={renderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.listContainer}
      />
      {isOrderConfirmed ? (
        <ThemedView style={styles.confirmationContainer}>
          <ThemedText style={styles.confirmationText}>Votre commande :</ThemedText>
          {Object.entries(order).map(([name, quantity]) => {
            if (quantity > 0) {
              return (
                <ThemedText key={name} style={styles.confirmationItem}>
                  {name} x {quantity}
                </ThemedText>
              );
            }
            return null;
          })}
          <ThemedText style={styles.totalText}>Total: €{totalOrder.toFixed(2)}</ThemedText>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
            <ThemedText style={styles.buttonText}>Annuler la commande</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modifyButton} onPress={handleModifyOrder}>
            <ThemedText style={styles.buttonText}>Modifier la commande</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      ) : (
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
          <ThemedText style={styles.buttonText}>Confirmer la commande</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  foodPrice: {
    fontSize: 16,
    color: '#555',
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
    marginBottom: 100,
    backgroundColor: '#2196F3',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    margin: 16,
    alignItems: 'center',
  },
  confirmationContainer: {
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
  confirmationItem: {
    fontSize: 16,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#f44336',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: 'center',
  },
  modifyButton: {
    marginBottom: 100,
    backgroundColor: '#FFC107',
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    color: "#1F2937",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
    color: "#4B5563",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
});