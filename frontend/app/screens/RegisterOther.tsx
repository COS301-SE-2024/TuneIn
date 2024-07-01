import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons } from "@expo/vector-icons";
import { FontAwesome, MaterialIcons, AntDesign } from "@expo/vector-icons";

const RegisterOtherScreen: React.FC = () => {
	const router = useRouter();
	const { width } = Dimensions.get("window");

	let [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_700Bold,
	});

	if (!fontsLoaded) {
		return null;
	}

	const navigateToLogin = () => {
		router.navigate("screens/LoginStreaming");
	};

	const navigateToRegister = () => {
		router.navigate("screens/RegisterScreen");
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
			</View>

			<Text style={styles.welcomeText}>Authenticate With</Text>

			<View style={styles.buttonContainer}>
				<TouchableOpacity style={[styles.button, styles.otherButton]}>
					<AntDesign name="google" size={24} color="#000" style={styles.icon} />
					<Text style={styles.buttonText}>Google</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.button, styles.otherButton]}>
					<FontAwesome
						name="facebook"
						size={24}
						color="#000"
						style={styles.icon}
					/>
					<Text style={styles.buttonText}>Facebook</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.button, styles.otherButton]}>
					<FontAwesome
						name="apple"
						size={24}
						color="#000"
						style={styles.icon}
					/>
					<Text style={styles.buttonText}>Apple</Text>
				</TouchableOpacity>

				<TouchableOpacity style={[styles.button, styles.otherButton]}>
					<MaterialIcons
						name="email"
						size={24}
						color="#000"
						style={styles.icon}
					/>
					<Text style={styles.buttonText}>Email</Text>
				</TouchableOpacity>

				<View style={styles.dividerContainer}>
					<View style={styles.divider} />
					<Text style={styles.dividerText}>Or Login with Details</Text>
					<View style={styles.divider} />
				</View>

				<TouchableOpacity
					style={[styles.button, styles.otherButton]}
					onPress={navigateToRegister}
				>
					<Text style={styles.buttonText}>Account</Text>
				</TouchableOpacity>
			</View>

			<TouchableOpacity
				style={styles.registerContainer}
				onPress={navigateToLogin}
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
		marginBottom: 20,
		borderRadius: 30,
		flexDirection: "row",
		paddingHorizontal: 10,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3.84,
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
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
		width: "80%",
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#808080",
	},
	dividerText: {
		marginHorizontal: 10,
		fontSize: 14,
		color: "#000",
		fontFamily: "Poppins_500Medium",
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

export default RegisterOtherScreen;
