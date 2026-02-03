import { Timestamp } from "@react-native-firebase/firestore";

export interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: Timestamp;
}

export interface ProductExtra {
  name: string;
  price: number;
}

export interface ProductFromDB {
  id: string,
  category: string,
  description: string,
  name: string,
  price: number,
  services: string[],
  extras?: ProductExtra[],
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
  extras?: ProductExtra[];
}

export interface OrderItemInstance {
  id: string;
  extras: { [extraName: string]: number };
}

export interface OrderItemWithInstances {
  instances: OrderItemInstance[];
}

export interface OrderFromDB {
	chalet: string,
	id: string,
  order: {[productName: string]: OrderItemWithInstances};
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
  duration: string;
  location: string;
}

export interface DayActivities {
  day: string;
  activities: Activity[];
}

export interface Chalet {
  id: string; // This IS the chalet number
  booked: boolean;
  clientId?: string;
}

export interface ConsumptionRecord {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  createdAt: Timestamp;
}

export interface EmployeePermissions {
  canManageProducts: boolean;
  canManageEmployees: boolean;
  canManageChalets: boolean;
  canViewOrders: boolean;
  canManageActivities: boolean;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  permissions: EmployeePermissions;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}