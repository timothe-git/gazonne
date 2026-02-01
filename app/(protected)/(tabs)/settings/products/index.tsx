import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProductFromDB } from '@/types/types';
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query } from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

export default function ProductsScreen() {
  const router = useRouter();
  const db = getFirestore();

  const [products, setProducts] = useState<ProductFromDB[]>([]);
  const [isLoading, setIsLoading] = useState(false);


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
      setProducts(productsFromDB);
    });

    return () => unsubscribe();
  }, []);

  const handleNewProduct = () => {
    router.push('/(protected)/(tabs)/settings/products/form');
  };

  const handleEditProduct = (productId: string) => {
    router.push({
      pathname: '/(protected)/(tabs)/settings/products/form',
      params: { productId },
    });
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'Supprimer le produit',
      `Êtes-vous sûr de vouloir supprimer "${productName}" ?`,
      [
        { text: 'Annuler', onPress: () => {}, style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteDoc(doc(db, 'products', productId));
              Alert.alert('Succès', 'Produit supprimé');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le produit');
            } finally {
              setIsLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  const renderNewProductButton = () => (
    <TouchableOpacity 
      style={styles.newProductButton} 
      onPress={handleNewProduct}
      disabled={isLoading}
    >
      <ThemedText style={styles.newProductButtonText}>+ Nouveau produit</ThemedText>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }: { item: ProductFromDB }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => handleEditProduct(item.id)}
      disabled={isLoading}
    >
      <ThemedView style={styles.productContent}>
        <ThemedText style={styles.productName}>{item.name}</ThemedText>
        <ThemedText style={styles.productCategory}>{item.category}</ThemedText>
        <ThemedText style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
        <ThemedView style={styles.productFooter}>
          <ThemedText style={styles.productPrice}>{item.price}€</ThemedText>
          <ThemedView style={styles.servicesContainer}>
            {item.services && item.services.length > 0 ? (
              item.services.map((service, index) => (
                <ThemedText key={index} style={styles.productService}>{service}</ThemedText>
              ))
            ) : (
              <ThemedText style={styles.productService}>-</ThemedText>
            )}
          </ThemedView>
        </ThemedView>
      </ThemedView>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteProduct(item.id, item.name)}
        disabled={isLoading}
      >
        <ThemedText style={styles.deleteButtonText}>✕</ThemedText>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderNewProductButton}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Aucun produit. Créez-en un!</ThemedText>
          </ThemedView>
        }
      />
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
    paddingTop: 8,
  },
  newProductButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  newProductButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  productContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 12,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  productService: {
    fontSize: 12,
    backgroundColor: '#f0f0f0',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    color: '#666',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    paddingRight: 0,
  },
  deleteButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});
  