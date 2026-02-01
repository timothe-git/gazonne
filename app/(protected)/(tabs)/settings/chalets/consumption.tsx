import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OrderFromDB, OrderItemWithInstances } from '@/types/types';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, orderBy, query, Timestamp, updateDoc, where } from '@react-native-firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ConsumptionScreen() {
  const router = useRouter();
  const { chaletId, clientId } = useLocalSearchParams<{
    chaletId: string;
    clientId: string;
  }>();

  const db = getFirestore();
  const [orders, setOrders] = useState<OrderFromDB[]>([]);

  useEffect(() => {
    if (!chaletId) return;

    // Query orders for this chalet
    const q = query(
      collection(db, 'orders'),
      where('chalet', '==', chaletId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ordersFromDB: OrderFromDB[] = [];

      querySnapshot.forEach((doc: any) => {
        ordersFromDB.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      setOrders(ordersFromDB);
    });

    return () => unsubscribe();
  }, [chaletId]);

  const formatDate = (timestamp: Timestamp | null | undefined) => {
    if (!timestamp) return '';
    return timestamp.toDate().toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCloseAccount = () => {
    Alert.alert(
      'Fermer le compte',
      `Êtes-vous sûr de vouloir clôturer le compte du client ${clientId} ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              // Update chalet booked status back to false
              const chaletRef = doc(db, 'chalets', chaletId);
              await updateDoc(chaletRef, {
                booked: false,
                clientId: null,
              });

              // Delete all orders for this chalet
              const deletePromises = orders.map((order) =>
                deleteDoc(doc(db, 'orders', order.id))
              );
              await Promise.all(deletePromises);

              Alert.alert('Succès', 'Le compte a été clôturé', [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]);
            } catch (error) {
              console.error('Error closing account:', error);
              Alert.alert('Erreur', 'Impossible de clôturer le compte');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderOrderItem = ({ item }: { item: OrderFromDB }) => (
    <ThemedView style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <ThemedText style={styles.service}>{item.service}</ThemedText>
        <ThemedText style={styles.date}>{formatDate(item.createdAt)}</ThemedText>
      </View>

      {Object.entries(item.order).map(
        ([productName, productData]: [string, OrderItemWithInstances]) => {
          const instances = productData.instances ?? [];

          return (
            <ThemedView key={productName} style={styles.orderItemContainer}>
              {/* Product name and total quantity */}
              <ThemedText style={styles.productName}>
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
    </ThemedView>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>Chalet {chaletId}</ThemedText>
        <ThemedText style={styles.clientId}>Client: {clientId}</ThemedText>
      </ThemedView>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Aucune commande enregistrée</ThemedText>
          </ThemedView>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.closeAccountButton}
          onPress={handleCloseAccount}
        >
          <ThemedText style={styles.closeAccountButtonText}>
            Clôturer le compte
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  clientId: {
    fontSize: 16,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'transparent',
  },
  service: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  orderItemContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  extraText: {
    fontSize: 14,
    color: '#777',
    paddingLeft: 12,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  closeAccountButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeAccountButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
