import { Button, StyleSheet } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedView } from '@/components/ThemedView';
import { authContext } from '@/utils/AuthContext';
import { Image } from 'expo-image';
import { useContext } from 'react';

import QRCode from 'react-native-qrcode-svg';

export default function HomeScreen() {

	const authState = useContext(authContext);

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: 'white', dark: 'black' }}
			headerImage={
				<Image
					source={require('@/assets/images/gazonne-logo.png')}
					style={styles.reactLogo}
				/>
			}>
			<ThemedView style={styles.titleContainer}>
				<Button title="Logout" onPress={authState.logOut} />
			</ThemedView>
			<QRCode
				value="user@hotmail.com,user01"
			/>
			
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
