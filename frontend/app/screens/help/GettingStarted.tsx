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
import { colors } from "../../styles/colors";

export default function GettingStarted() {
	const router = useRouter();

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} testID="back-button">
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<Text style={styles.headerTitle}>Getting Started</Text>
				<View style={styles.headerSpacer} />
			</View>

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<FontAwesome
						name="music"
						size={24}
						color="#08bdbd"
						style={styles.icon}
						testID="music-icon"
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
						testID="info-icon"
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

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<MaterialCommunityIcons
						name="account"
						size={24}
						color="#08bdbd"
						style={styles.icon}
						testID="account-icon"
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

			<TouchableOpacity style={styles.card}>
				<View style={styles.cardContent}>
					<Ionicons
						name="log-in-outline"
						size={24}
						color="#08bdbd"
						style={styles.icon}
						testID="login-icon"
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
		backgroundColor: colors.backgroundColor,
		paddingVertical: 20,
		paddingHorizontal: 15,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
		marginBottom: 20,
	},
	closeButton: {
		fontSize: 20,
		fontWeight: "bold",
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
	},
	headerSpacer: {
		width: 0,
	},
	card: {
		marginBottom: 20,
		borderRadius: 10,
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 5,
		elevation: 3,
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
});
