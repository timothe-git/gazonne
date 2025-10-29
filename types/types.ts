import { Timestamp } from "@react-native-firebase/firestore";

export interface Message {
  id: string;
  sender: string;
  content: string;
  createdAt: Timestamp;
}