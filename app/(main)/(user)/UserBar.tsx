import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FlatList, StyleSheet } from 'react-native';


interface MenuCategory {
  category: string;
  items: MenuItem[];
}


interface MenuItem {
  id: string;
  name: string;
  price: string;
  description: string;
}

const tapas: MenuItem[] = [
  { id: '1', name: 'Planche Apéro', price: '12€', description: 'Saucisse sèche, pâté, fromage, brochette de viande, farçous et fruit de saison' },
  { id: '2', name: 'Planche Gourmande', price: '15€', description: 'Charcuteries, fromage, brochette de viande, farçous, tartinade, fruit de saison et gâteau ' },
  { id: '3', name: ' Petite Frite', price: '3,50€', description: '' },
  { id: '4', name: ' Grande Frite', price: '5,50€', description: '' },
];

const pizzas: MenuItem[] = [
  { id: '1', name: 'Quatre-saisons (végétarienne)', price: '13€', description: 'Sauce tomate, oignons, courgettes, aubergines, poivrons, emmental' },
  { id: '2', name: 'Tex-Mex', price: '13€', description: 'Sauce tomate, oignons, poivrons, merguez, chorizo, emmental' },
  { id: '3', name: 'Bolo', price: '13€', description: 'Sauce tomate, viande hachée Aubrac, oignons, emmental, mozzarella' },
  { id: '4', name: 'Gazonne', price: '14€', description: 'Crème fraîche, pommes de terre, oignons, jambon sec, Tomme de l’Aubrac, emmental' },
  { id: '5', name: 'Quatre fromages', price: '13€', description: 'Crème fraîche, chèvre, roquefort, emmental, mozzarella' },
  { id: '6', name: 'Chèvre', price: '13€', description: 'Crème fraîche, chèvre, emmental, mozzarella, miel' },
  { id: '7', name: 'Roquefort', price: '13€', description: 'Crème fraîche, roquefort, emmental, mozzarella' },
  { id: '8', name: 'Chérubin', price: '10€', description: 'Sauce tomate, jambon, emmental' },
];

const burgers: MenuItem[] = [
  { id: '1', name: 'Burger Aveyronnais ', price: '15€', description: 'Steak de l\'Aubrac, fromage Laguiole, salade verte, tomate' },
];

const desserts: MenuItem[] = [
  { id: '1', name: 'Crêpe', price: '2€', description: 'Supplément chocolat ou caramel ou confiture : +0,50€ Supplément chantilly : +0,50€' },
  { id: '2', name: 'Gaufre', price: '3€', description: 'Supplément chocolat ou caramel ou confiture : +0,50€ Supplément chantilly : +0,50€' },
  { id: '3', name: 'Smoothie', price: '4€', description: 'COCONUT CRUSH : Ananas et lait de coco\nSTRAWBERRY FANTASY : Fraise, banane\nRASPBERRY HEAVEN : Pomme, framboise, mangue, myrtille\nGREEN REVIVER : Banane, chou kale, mangue, citronnelle\nPINEAPPLE SUNSET : Ananas, mangue, papaye' },
];

const menuData: MenuCategory[] = [
  {
    category: "tapas",
    items: tapas,
  },
  {
    category: "pizzas",
    items: pizzas,
  },
  {
    category: "burgers",
    items: burgers,
  },
  {
    category: "desserts",
    items: desserts,
  },
]


export default function UserBar() {

  const renderItem = ({ item }: { item: MenuItem }) => (
    <ThemedView style={styles.menuItem}>
      <ThemedView style={styles.row}>
        <ThemedText style={styles.plateName}>{item.name}</ThemedText>
        <ThemedView style={styles.priceContainer}>
          <ThemedText style={styles.price}>{item.price}</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedText style={styles.description}>{item.description}</ThemedText>
    </ThemedView>
  );

  const renderCategory = ({ item }: { item: MenuCategory }) => (
    <ThemedView style={styles.categoryContainer}>
      <ThemedText style={styles.categoryTitle}>{item.category}</ThemedText>
      <FlatList
        data={item.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false} // Disable scrolling for nested FlatList
      />
    </ThemedView>
  );

  return (
    <ThemedView>
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