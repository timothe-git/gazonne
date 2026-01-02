import { useRouter } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';

import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from '@react-native-firebase/auth';




type AuthState = {
    isLoggedIn: boolean;
	isAdmin: boolean;
	isReady: boolean;
	logIn: (email: string, password: string) => void;
	register: (email: string, password: string) => void;
	logOut: () => void;
	error: string;
};


const authStorageKey = "auth-key";


export const authContext = createContext<AuthState>({
	isLoggedIn: false,
	isAdmin: false,
	isReady: false,
	logIn: (email: string, password: string) => {},
	register: (email: string, password: string) => {},
	logOut: () => {},
	error: "",
})


export function AuthProvider({ children }: PropsWithChildren) {

	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState("");

    const router = useRouter();

	const storeAuthState = async (newState: { isLoggedIn: boolean, isAdmin: boolean }) => {
		try {
			const jsonValue = JSON.stringify(newState);
			await AsyncStorage.setItem(authStorageKey, jsonValue);
		} catch (error) {
			console.log("Error saving", error);
		}
	}

	const register = (email: string, password: string) => {
		const auth = getAuth();
		createUserWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				setIsLoggedIn(true);
				storeAuthState({ isLoggedIn: true, isAdmin: (email === "admin@hotmail.be") ? true : false });
				router.replace('/');
			})
			.catch((error) => {
				setError("Login error");
				console.log(error);
			});
		}

	const logIn = (email: string, password: string) => {
		const auth = getAuth();
		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				setIsLoggedIn(true);
				storeAuthState({ isLoggedIn: true, isAdmin: (email === "admin@hotmail.be") ? true : false });
				router.replace('/');
			})
			.catch((error) => {
				setError("Register error");
				console.log(error);
			});
	};

	const logOut = () => {
		signOut(getAuth()).then(() => {
			console.log('User signed out!');
			setIsLoggedIn(false);
			storeAuthState({ isLoggedIn: false, isAdmin: false });
			router.replace('/login');
		});
	};

	useEffect(() => {
		const getAuthFromStorage = async () => {
			try {
				const value = await AsyncStorage.getItem(authStorageKey);
				if (value !== null) {
					const auth = JSON.parse(value);
					setIsLoggedIn(auth.isLoggedIn);
					setIsAdmin(auth.isAdmin);
				}
			} catch (error) {
				console.log('Error fetching from storage', error);
			}
			setIsReady(true);
		};
		getAuthFromStorage();
	}, []);

	return (
		<authContext.Provider value={{ isLoggedIn, isAdmin, isReady, logIn, register, logOut, error }}>
			{children}
		</authContext.Provider>
	);
}