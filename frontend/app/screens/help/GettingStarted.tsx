import React from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
} from "react-native";
import {
	FontAwesome,
	MaterialCommunityIcons,
	Ionicons,
	AntDesign,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function GettingStarted() {
	const router = useRouter();
	const navigateToLogin = () => {
		router.navigate("../LoginScreen");
	};

	const navigateToRegister = () => {
		router.navigate("../RegisterScreen");
	};

	return (
		<ScrollView style={styles.container}>
			<TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
				<Ionicons name="chevron-back" size={24} color="black" />
			</TouchableOpacity>
			<Text style={styles.header}>Getting Started</Text>

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<FontAwesome
						name="music"
						size={24}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Introduction</Text>
						<Text style={styles.cardText}>
							Welcome to TuneIn, where music becomes a shared experience that
							connects people, transcending distances and creating lasting bonds
							through the power of music.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<AntDesign
						name="infocirlceo"
						size={24}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>About</Text>
						<Text style={styles.cardText}>
							Discover and share music with friends and make new ones around the
							world. With TuneIn you can create rooms, join rooms, and listen to
							music together with others.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.card} onPress={navigateToRegister}>
				<View style={styles.cardContent}>
					<MaterialCommunityIcons
						name="account"
						size={24}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Creating an Account</Text>
						<Text style={styles.cardText}>
							Sign up using your premium Spotify account or your email but don't
							forget to link your Spotify account to seamlessly sync your music
							library into the app.
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<TouchableOpacity style={styles.card} onPress={navigateToLogin}>
				<View style={styles.cardContent}>
					<Ionicons
						name="log-in-outline"
						size={24}
						color="#08bdbd"
						style={styles.icon}
					/>
					<View style={styles.textContainer}>
						<Text style={styles.cardTitle}>Logging In</Text>
						<Text style={styles.cardText}>
							Log in with your registered credentials to access personalized
							content.
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ecf0f1",
		paddingVertical: 20,
		paddingHorizontal: 15,
	},
	header: {
		fontSize: 28,
		fontWeight: "bold",
		marginBottom: 20,
		color: "#2c3e50",
		textAlign: "center",
	},
	card: {
		marginBottom: 20,
		borderRadius: 10,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 3, // for Android
	},
	cardContent: {
		flexDirection: "row",
		alignItems: "center",
		padding: 15,
	},
	icon: {
		marginRight: 15,
	},
	textContainer: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#2c3e50",
		marginBottom: 5,
	},
	cardText: {
		fontSize: 16,
		color: "#34495e",
		lineHeight: 22,
	},
	backButton: {
		position: "absolute",
		top: 10,
		left: 10,
		zIndex: 1,
	},
});
