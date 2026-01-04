import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { collection, getFirestore, onSnapshot, query, where } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

/*interface FoodItem {
  name: string;
  price: number;
}*/

interface OrderFromDB {
	chalet: string,
	id: string,
  order: {[key: string]: number}; // expected {"Chocolatine": 3, "Croissant": 0, "Pain": 1}
  service: string;

}

interface Order {
	chalet: string,
	id: string,
  order: {name: string; quantity: number;}[];
  //service: string;
}





export default function AdminBreakfastOrder() {

	const [allOrders, setAllOrders] = useState<Order[]>([]);
	const [totalOrder, setTotalOrder] = useState<Order>({
    chalet: "Total",
    id: "",
    order: [],
  });


	useEffect(() => {
			
			// query to retrieve
			const q = query(collection(db, 'orders'), where('service', '==', 'petit-dej'));
	
			const unsubscribe = onSnapshot(q, (querySnapshot) => {
				const ordersFromDB: OrderFromDB[] = [];
				const orders: Order[] = [];

				querySnapshot.forEach((doc: any) => {
						ordersFromDB.push({
							id: doc.id,
							...doc.data(),
						});
						
				});
				ordersFromDB.forEach((item, index) => {
					orders.push({
						chalet: item.chalet,
						id: item.id,
						order: transformOrder(item.order),
					});
				});
				setAllOrders(orders);
				setTotalOrder(computeTotalOrder(ordersFromDB));
			});
	
			return () => unsubscribe();
		}, []);

	const db = getFirestore();

	const transformOrder = (order: {[key: string]: number}) => {
    return Object.entries(order).map(([name, quantity]) => ({
        name,
        quantity
    }));
};

	const computeTotalOrder = (orders: OrderFromDB[]) => {
		const totalOrder: Order = {
			chalet: "Total",
			id: "",
			order: [
				{name: "Pain", quantity: 0},
				{name: "Chocolatine", quantity: 0},
				{name: "Croissant", quantity: 0},
			]
		};

		const totalElements: {[key: string]: number} = {};

		orders.forEach(item => {
			Object.entries(item.order).forEach(([name, quantity]) => {
				if (totalElements[name]) {
					totalElements[name] += quantity;
				} else {
					totalElements[name] = quantity;
				}
			});
		});

		totalOrder.order = transformOrder(totalElements);

		return totalOrder;
	};


	const renderOrderItem = ({ item }: { item: { name: string; quantity: number } }) => (
    <ThemedView style={styles.orderItemContainer}>
      <ThemedText style={styles.foodName}>{item.name}</ThemedText>
      <ThemedText style={styles.foodQuantity}>x {item.quantity}</ThemedText>
    </ThemedView>
  );

  const renderCustomerOrder = ({ item }: { item: Order }) => (
    <ThemedView style={styles.customerContainer}>
      <ThemedText style={styles.customerName}>{item.chalet}</ThemedText>
      <FlatList
        data={item.order}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.orderListContainer}
        scrollEnabled={false}
      />
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
			{renderCustomerOrder({ item: totalOrder })}
      <ThemedText style={styles.title}>Commande par chalet</ThemedText>
      <FlatList
        data={allOrders}
        renderItem={renderCustomerOrder}
        keyExtractor={(item) => item.chalet}
        contentContainerStyle={styles.listContainer}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
	listContainer: {
    paddingBottom: 16,
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
});
