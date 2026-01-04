import { Button, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authContext } from '@/utils/AuthContext';
import { Image } from 'expo-image';
import { useContext } from 'react';


export default function SettingsScreen() {

	const authState = useContext(authContext);
	//console.log(authState.email);
	//console.log(authState.isLoggedIn);

	function logout() {
		authState.logOut();
	}

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: 'white', dark: 'black' }}
			headerImage={
				<Image
					source={require('@/assets/images/gazonne-logo.png')}
					style={styles.reactLogo}
				/>
			}>
			<ThemedText>{authState.email}</ThemedText>
			<ThemedView style={styles.titleContainer}>
				<Button title="Logout" onPress={authState.logOut} />
			</ThemedView>
			
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: '100%',
		width: '100%',
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
});
