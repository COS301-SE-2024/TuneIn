import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Platform,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import * as WebBrowser from "expo-web-browser";
if (Platform.OS === "web") {
	console.log(WebBrowser.maybeCompleteAuthSession());
}

const RedirectSuccessScreen: React.FC = () => {
	const router = useRouter();
	let [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_700Bold,
	});

	if (Platform.OS === "web") {
		console.log(WebBrowser.maybeCompleteAuthSession());
	}

	if (!fontsLoaded) {
		return null;
	}
	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
			</View>
			<Text style={styles.welcomeText}>Redirect Successful</Text>
			<View style={styles.messageContainer}>
				<Text style={styles.successMessage}>
					You have been successfully redirected from Spotify!
				</Text>
			</View>
			<TouchableOpacity
				style={styles.button}
				onPress={() => router.navigate("screens/Home")}
			>
				<FontAwesome name="home" size={24} color="#000" style={styles.icon} />
				<Text style={styles.buttonText}>Go to Home</Text>
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
	welcomeText: {
		fontSize: 32,
		fontWeight: "bold",
		fontFamily: "Poppins_700Bold",
		textAlign: "center",
		marginTop: 30,
		marginBottom: 50,
		paddingHorizontal: 20,
	},
	messageContainer: {
		alignItems: "center",
		marginBottom: 30,
	},
	successMessage: {
		fontSize: 18,
		fontWeight: "bold",
		fontFamily: "Poppins_500Medium",
		textAlign: "center",
		color: "#4CAF50", // Green color for success message
	},
	button: {
		width: "75%",
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 30,
		flexDirection: "row",
		paddingHorizontal: 10,
		backgroundColor: "#FFFFFF",
		borderColor: "#808080",
		borderWidth: 1,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3.84,
		alignSelf: "center",
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
});

export default RedirectSuccessScreen;
