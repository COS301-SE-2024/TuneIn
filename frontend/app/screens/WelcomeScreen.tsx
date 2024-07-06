import React from "react";
import {
	View,
	Text,
	ImageBackground,
	TouchableOpacity,
	Dimensions,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons from Expo Icons
import { MaterialCommunityIcons } from "@expo/vector-icons";

const WelcomeScreen: React.FC = () => {
	const router = useRouter();
	const { width, height } = Dimensions.get("window");

	const navigateToLogin = () => {
		router.navigate("/screens/Auth/LoginScreen");
	};

	const navigateToRegister = () => {
		router.navigate("/screens/Auth/RegisterScreen");
	};

	return (
		<View style={styles.container}>
			<ImageBackground
				source={require("../../assets/text.jpg")}
				style={[styles.imageBackground, { width, height: height * 0.5 }]}
				resizeMode="cover"
			>
				<TouchableOpacity
					style={styles.helpButton}
					onPress={() => console.log("Help pressed")}
				>
					<MaterialCommunityIcons
						name="help-circle-outline"
						size={24}
						color="#FFF"
						style={styles.helpIcon}
					/>
				</TouchableOpacity>
			</ImageBackground>
			<View style={styles.innerContainer}>
				<Text style={styles.logoText}>Logo</Text>
				<Text style={styles.titleText}>TuneIn</Text>
				<TouchableOpacity style={styles.loginButton} onPress={navigateToLogin}>
					<Text style={styles.loginButtonText}>Login</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={styles.registerButton}
					onPress={navigateToRegister}
				>
					<Text style={styles.registerButtonText}>Register</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
	},
	imageBackground: {
		width: "100%",
		height: "50%",
		position: "relative", // Ensure the ImageBackground is relative for absolute positioning to work
	},
	innerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 16,
	},
	logoText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 20,
	},
	titleText: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 32,
	},
	loginButton: {
		width: "92%",
		height: 48,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#4C51BF",
		borderRadius: 24,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	loginButtonText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#FFF",
	},
	registerButton: {
		width: "92%",
		height: 48,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFF",
		borderColor: "#000",
		borderWidth: 1,
		borderRadius: 24,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	registerButtonText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000",
	},
	helpButton: {
		position: "absolute",
		top: 20,
		right: 20,
		backgroundColor: "transparent",
		padding: 10,
	},
	helpIcon: {
		marginRight: 5,
	},
});

export default WelcomeScreen;
