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
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortByName, setSortByName] = useState<'asc' | 'desc'>('asc');


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
    router.push('/settings/products/form');
  };

  const handleEditProduct = (productId: string) => {
    router.push({
      pathname: '/settings/products/form',
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

  // Get unique services from all products
  const getAllServices = (): string[] => {
    const services = new Set<string>();
    products.forEach(product => {
      product.services?.forEach(service => services.add(service));
    });
    return Array.from(services).sort();
  };

  // Get unique categories from all products
  const getAllCategories = (): string[] => {
    const categories = new Set<string>();
    products.forEach(product => {
      categories.add(product.category);
    });
    return Array.from(categories).sort();
  };

  // Filter and sort products
  const filteredAndSortedProducts = (() => {
    let filtered = products;

    // Apply service filter
    if (selectedServices.length > 0) {
      filtered = filtered.filter(product =>
        product.services?.some(service => selectedServices.includes(service))
      );
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Apply name sort
    filtered.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name);
      return sortByName === 'asc' ? comparison : -comparison;
    });

    return filtered;
  })();

  const toggleServiceFilter = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const toggleCategoryFilter = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
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

  const renderFilterSortBar = () => (
    <ThemedView style={styles.filterSortContainer}>
      {/* Services Filter */}
      <ThemedView style={styles.filterSection}>
        <ThemedText style={styles.filterLabel}>Services:</ThemedText>
        <ThemedView style={styles.servicesFilterContainer}>
          {getAllServices().map(service => (
            <TouchableOpacity
              key={service}
              style={[
                styles.serviceChip,
                selectedServices.includes(service) && styles.serviceChipActive
              ]}
              onPress={() => toggleServiceFilter(service)}
            >
              <ThemedText style={[
                styles.serviceChipText,
                selectedServices.includes(service) && styles.serviceChipTextActive
              ]}>
                {service}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Categories Filter */}
      <ThemedView style={styles.filterSection}>
        <ThemedText style={styles.filterLabel}>Catégories:</ThemedText>
        <ThemedView style={styles.categoriesFilterContainer}>
          {getAllCategories().map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategories.includes(category) && styles.categoryChipActive
              ]}
              onPress={() => toggleCategoryFilter(category)}
            >
              <ThemedText style={[
                styles.categoryChipText,
                selectedCategories.includes(category) && styles.categoryChipTextActive
              ]}>
                {category}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      </ThemedView>

      {/* Sort */}
      <ThemedView style={styles.sortSection}>
        <ThemedText style={styles.sortLabel}>Trier:</ThemedText>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setSortByName(sortByName === 'asc' ? 'desc' : 'asc')}
        >
          <ThemedText style={styles.sortButtonText}>
            {sortByName === 'asc' ? 'A-Z' : 'Z-A'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
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
        data={filteredAndSortedProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {renderNewProductButton()}
            {renderFilterSortBar()}
          </>
        }
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
  filterSortContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  filterSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  servicesFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  serviceChipActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  serviceChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  serviceChipTextActive: {
    color: '#fff',
  },
  categoriesFilterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  categoryChipActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  sortSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sortButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  sortButtonText: {
    fontSize: 13,
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
  