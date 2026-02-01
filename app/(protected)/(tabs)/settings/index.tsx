import { Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { authContext } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useContext } from 'react';


export default function SettingsScreen() {

	const authState = useContext(authContext);
	const cardBackground = useThemeColor({ light: '#F8FAFC', dark: '#1E2428' }, 'background');
	const cardBorder = useThemeColor({ light: '#E5E7EB', dark: '#2B3136' }, 'background');
	const subtleText = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');

	const settingsItems = [
		{ label: 'Produits', href: '/settings/products', description: 'Gérer les produits' },
		//{ label: 'Employés', href: '/settings/employees', description: 'Gérer les employés' },
		//{ label: 'Chalets', href: '/settings/chalets', description: 'Gérer les chalets' },
		//{ label: 'Historique de commande', href: '/settings/order-history', description: 'Consulter les commandes' },
		//{ label: 'Activités', href: '/settings/activities', description: 'Suivre les activités' },
	];

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: 'white', dark: 'black' }}
			headerImage={
				<Image
					source={require('@/assets/images/gazonne-logo.png')}
					style={styles.reactLogo}
				/>
			}
			>
			<ThemedView style={styles.content}>
				<ThemedText type="title">Paramètres</ThemedText>
				<ThemedText style={[styles.sectionLabel, { color: subtleText }]}>Gestion</ThemedText>

				<View style={styles.list}>
					{settingsItems.map((item) => (
						<Link key={item.href} href={item.href} asChild>
							<Pressable
								style={({ pressed }) => [
									styles.card,
									{ backgroundColor: cardBackground, borderColor: cardBorder },
									pressed && styles.cardPressed,
								]}
							>
								<View style={styles.cardContent}>
									<ThemedText type="defaultSemiBold">{item.label}</ThemedText>
									<ThemedText style={[styles.cardSubtitle, { color: subtleText }]}>{item.description}</ThemedText>
								</View>
							</Pressable>
						</Link>
					))}
				</View>

				<Pressable style={[styles.logoutButton, { borderColor: cardBorder }]} onPress={authState.logOut}>
					<ThemedText type="defaultSemiBold">Se déconnecter</ThemedText>
				</Pressable>
			</ThemedView>

		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	content: {
		paddingHorizontal: 20,
		paddingVertical: 16,
		gap: 12,
	},
	sectionLabel: {
		fontSize: 13,
		textTransform: 'uppercase',
		letterSpacing: 1,
		marginTop: 4,
	},
	list: {
		gap: 12,
	},
	card: {
		borderWidth: 1,
		borderRadius: 14,
		paddingVertical: 14,
		paddingHorizontal: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		shadowColor: '#000',
		shadowOpacity: 0.06,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	cardPressed: {
		opacity: 0.85,
		transform: [{ scale: 0.99 }],
	},
	cardContent: {
		gap: 4,
		flex: 1,
		paddingRight: 8,
	},
	cardSubtitle: {
		fontSize: 13,
	},
	logoutButton: {
		marginTop: 8,
		borderWidth: 1,
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: 'center',
	},
	reactLogo: {
		height: '100%',
		width: '100%',
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
});
