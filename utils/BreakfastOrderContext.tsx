import { useRouter } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';



type BreakfastOrderState = {
    orderId: string;
    isReady: boolean;
    storeBreakfastOrder: (orderId: string) => void;
};


const breakfastOrderStorageKey = "breakfast-key";


export const breakfastOrderContext = createContext<BreakfastOrderState>({
	orderId: "",
    isReady: false,
    storeBreakfastOrder: (orderId: string) => {},
})


export function BreakfastOrderProvider({ children }: PropsWithChildren) {

	const [orderId, setOrderId] = useState("");
    const [isReady, setIsReady] = useState(false);

    const router = useRouter();

	const storeBreakfastOrderState = async (newState: { orderId: string }) => {
		try {
			const jsonValue = JSON.stringify(newState);
			await AsyncStorage.setItem(breakfastOrderStorageKey, jsonValue);
		} catch (error) {
			console.log("Error saving", error);
		}
	}

    const storeBreakfastOrder = (orderId: string) => {
		setOrderId(orderId);
        console.log("id: ", orderId);
		storeBreakfastOrderState({ orderId: orderId });
	};


	useEffect(() => {
		const getBreakfastOrderFromStorage = async () => {
			try {
				const value = await AsyncStorage.getItem(breakfastOrderStorageKey);
				if (value !== null) {
					const breakfastOrder = JSON.parse(value);
					setOrderId(breakfastOrder.orderId);
				}
			} catch (error) {
				console.log('Error fetching from storage', error);
			}
			setIsReady(true);
		};
		getBreakfastOrderFromStorage();
	}, []);

	return (
		<breakfastOrderContext.Provider value={{ orderId, isReady, storeBreakfastOrder }}>
			{children}
		</breakfastOrderContext.Provider>
	);
}