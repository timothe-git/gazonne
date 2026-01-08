import { Timestamp } from "@react-native-firebase/firestore";

export interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: Timestamp;
}

export interface ProductFromDB {
  id: string,
  category: string,
  description: string,
  name: string,
  price: number,
  service: string,
}

export interface MenuCategory {
  category: string;
  products: MenuProduct[];
}

export interface MenuProduct {
  id: string;
  name: string;
  priceString: string;
  price: number;
  description: string;
}

export interface OrderFromDB {
	chalet: string,
	id: string,
  order: {[key: string]: number};
  service: string;
	createdAt: Timestamp,
}

export interface Order {
	chalet: string,
	id: string,
  order: {name: string; quantity: number;}[];
  //service: string;
}

export interface Activity {
  name: string;
  startTime: string;
  location: string;
}

export interface DayActivities {
  day: string;
  activities: Activity[];
}