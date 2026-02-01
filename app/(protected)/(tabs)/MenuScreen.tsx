import ServiceSelector from '@/components/ServiceSelector';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MenuCategory, MenuProduct, ProductFromDB } from '@/types/types';
import { collection, getFirestore, onSnapshot, query, where } from '@react-native-firebase/firestore';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';


export default function MenuScreen() {

  const [menuData, setMenuData] = useState<MenuCategory[]>([]);
  const [selectedService, setSelectedService] = useState<string>('Snack');

  const db = getFirestore();
  
  
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
                priceString: `€${product.price}`,
                price: product.price,
                description: product.description
              };
  
              // Add the MenuProduct to the corresponding MenuCategory
              categoriesMap[product.category].products.push(menuProduct);
            });
  
            // Convert the map to an array of MenuCategory
            //console.log(categoriesMap);
            //console.log(Object.values(categoriesMap));
            setMenuData(Object.values(categoriesMap));
          });
      
          return () => unsubscribe();
        }, [selectedService]);

  const renderItem = ({ item }: { item: MenuProduct }) => (
    <ThemedView style={styles.menuItem}>
      <ThemedView style={styles.row}>
        <ThemedText style={styles.plateName}>{item.name}</ThemedText>
        <ThemedView style={styles.priceContainer}>
          <ThemedText style={styles.price}>{item.priceString}</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
    </ThemedView>
  );

  const renderCategory = ({ item }: { item: MenuCategory }) => (
    <ThemedView style={styles.categoryContainer}>
      <ThemedText style={styles.categoryTitle}>{item.category}</ThemedText>
      <FlatList
        data={item.products}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false} // Disable scrolling for nested FlatList
      />
    </ThemedView>
  );

  return (
    <ThemedView>
      <ServiceSelector 
        selectedService={selectedService}
        onServiceChange={setSelectedService}
      />
      <FlatList
        data={menuData}
        renderItem={renderCategory}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.container}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foreground: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
  foregroundText: {
    fontSize: 20,
    color: '#fff',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    color: 'green',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  menuItem: {
    marginBottom: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
    row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  plateName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  priceContainer: {
    borderLeftWidth: 1,
    borderLeftColor: '#ccc',
    paddingLeft: 10,
    paddingRight: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});