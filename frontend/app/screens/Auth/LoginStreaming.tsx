import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import * as StorageService from "../../services/StorageService";

const LoginStreamingScreen: React.FC = () => {
	const router = useRouter();

	let [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_700Bold,
	});

	if (!fontsLoaded) {
		return null;
	}

	const navigateToRegister = () => {
		router.navigate("screens/Auth/RegisterStreaming");
	};

	const navigateToOther = () => {
		router.navigate("screens/Auth/LoginOther");
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
			</View>

			<Text style={styles.welcomeText}>Welcome Back to TuneIn</Text>

			<View style={styles.buttonContainer}>
				<TouchableOpacity style={[styles.button, styles.otherButton]}>
					<Icon name="spotify" size={24} color="#000" style={styles.icon} />
					<Text style={styles.buttonText}>Spotify</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.button, styles.otherButton]}>
					<Icon
						name="youtube-play"
						size={24}
						color="#000"
						style={styles.icon}
					/>
					<Text style={styles.buttonText}>YouTube Music</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.button, styles.otherButton]}>
					<Icon name="music" size={24} color="#000" style={styles.icon} />
					<Text style={styles.buttonText}>Apple Music</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[styles.button, styles.otherButton]}
					onPress={navigateToOther}
				>
					<Text style={styles.buttonText}>Other</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity
				style={styles.registerContainer}
				onPress={navigateToRegister}
			>
				<Text style={styles.registerText}>
					Don’t have an account?{" "}
					<Text style={styles.registerBoldText}>Register Now</Text>
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 20,
		paddingHorizontal: 16,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		marginRight: "auto",
	},
	backText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	logoText: {
		fontSize: 24,
		fontWeight: "bold",
		fontFamily: "Poppins_700Bold",
	},
	welcomeText: {
		fontSize: 32,
		fontWeight: "bold",
		fontFamily: "Poppins_700Bold",
		textAlign: "center",
		marginTop: 30,
		marginBottom: 50,
		paddingHorizontal: 20,
	},
	buttonContainer: {
		alignItems: "center",
	},
	button: {
		width: "75%",
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 30,
		borderRadius: 30,
		flexDirection: "row",
		paddingHorizontal: 10,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3.84,
	},
	spotifyButton: {
		backgroundColor: "#1DB954",
	},
	youtubeButton: {
		backgroundColor: "#FF0000",
	},
	appleButton: {
		backgroundColor: "#fc3c44",
	},
	otherButton: {
		backgroundColor: "#FFFFFF",
		borderColor: "#808080",
		borderWidth: 1,
	},
	icon: {
		marginRight: 10,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#000",
		fontFamily: "Poppins_700Bold",
	},
	registerContainer: {
		position: "absolute",
		bottom: 16,
		left: 0,
		right: 0,
		padding: 16,
		alignItems: "center",
	},
	registerText: {
		fontSize: 16,
		color: "#000",
		fontFamily: "Poppins_500Medium",
	},
	registerBoldText: {
		fontWeight: "bold",
		fontFamily: "Poppins_700Bold",
	},
});

export default LoginStreamingScreen;
