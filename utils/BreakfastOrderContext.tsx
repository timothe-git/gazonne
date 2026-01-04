import { createContext, PropsWithChildren, useEffect, useState } from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';



type BreakfastOrderState = {
    orderId: string;
    isReady: boolean;
    storeBreakfastOrder: (orderId: string) => void;
	removeBreakfastOrder: () => void;
};


const breakfastOrderStorageKey = "breakfast-key";


export const breakfastOrderContext = createContext<BreakfastOrderState>({
	orderId: "",
    isReady: false,
    storeBreakfastOrder: (orderId: string) => {},
	removeBreakfastOrder: () => {},
})


export function BreakfastOrderProvider({ children }: PropsWithChildren) {

	const [orderId, setOrderId] = useState("");
    const [isReady, setIsReady] = useState(false);

	const storeBreakfastOrderState = async (newState: { orderId: string }) => {
		try {
			const jsonValue = JSON.stringify(newState);
			await AsyncStorage.setItem(breakfastOrderStorageKey, jsonValue);
		} catch (error) {
			console.log("Error saving breakfastOrder state: ", error);
		}
	};

	const removeBreakfastOrderState = async () => {
		try {
			await AsyncStorage.removeItem(breakfastOrderStorageKey);
		} catch (error) {
			console.error('Error removing breakfastOrder state: ', error);
		}
	};

    const storeBreakfastOrder = (orderId: string) => {
		setOrderId(orderId);
		storeBreakfastOrderState({ orderId: orderId });
	};


	const removeBreakfastOrder = () => {
		setOrderId("");
		removeBreakfastOrderState();
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
		<breakfastOrderContext.Provider value={{ orderId, isReady, storeBreakfastOrder, removeBreakfastOrder }}>
			{children}
		</breakfastOrderContext.Provider>
	);
}