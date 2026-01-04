import { useRouter } from "expo-router";
import { createContext, PropsWithChildren, useEffect, useState } from "react";

import AsyncStorage from '@react-native-async-storage/async-storage';

import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, signOut } from '@react-native-firebase/auth';




type AuthState = {
	email: string;
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
	email: "",
	isLoggedIn: false,
	isAdmin: false,
	isReady: false,
	logIn: (email: string, password: string) => {},
	register: (email: string, password: string) => {},
	logOut: () => {},
	error: "",
})


export function AuthProvider({ children }: PropsWithChildren) {

	const [email, setEmail] = useState("");
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [isReady, setIsReady] = useState(false);
	const [error, setError] = useState("");

    const router = useRouter();

	const storeAuthState = async (newState: { email: string, isLoggedIn: boolean, isAdmin: boolean }) => {
		try {
			const jsonValue = JSON.stringify(newState);
			await AsyncStorage.setItem(authStorageKey, jsonValue);
		} catch (error) { 
			console.log("Error saving auth state: ", error);
		}
	}

	const removeAuthState = async () => {
		try {
			await AsyncStorage.removeItem(authStorageKey);
		} catch (error) {
			console.error('Error removing auth state: ', error);
		}
		};

	const register = (emailInput: string, passwordInput: string) => {
		const auth = getAuth();
		createUserWithEmailAndPassword(auth, emailInput, passwordInput)
			.then((userCredential) => {

				setEmail(emailInput);
				setIsLoggedIn(true);
				setIsAdmin(emailInput === "admin@hotmail.be");

				storeAuthState({ email, isLoggedIn, isAdmin });
				
				router.replace('/');
			})
			.catch((error) => {
				setError("Login error");
				console.error(error);
			});
		}

	const logIn = (emailInput: string, passwordInput: string) => {
		const auth = getAuth();
		signInWithEmailAndPassword(auth, emailInput, passwordInput)
			.then((userCredential) => {

				setEmail(emailInput);
				setIsLoggedIn(true);
				setIsAdmin(emailInput === "admin@hotmail.be");

				storeAuthState({ email, isLoggedIn, isAdmin });

				router.replace('/');
			})
			.catch((error) => {
				setError("Register error");
				console.error(error);
			});
	};

	const logOut = () => {
		signOut(getAuth())
			.then(() => {
				console.log('User signed out!');
				setEmail("");
				setIsLoggedIn(false);
				setIsAdmin(false);
				removeAuthState();
				router.replace('/');
			});
	};

	useEffect(() => {
		const getAuthFromStorage = async () => {
			try {
				const value = await AsyncStorage.getItem(authStorageKey);
				if (value !== null) {
					const auth = JSON.parse(value);
					setEmail(auth.email);
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
		<authContext.Provider value={{ email, isLoggedIn, isAdmin, isReady, logIn, register, logOut, error }}>
			{children}
		</authContext.Provider>
	);
}