import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";

const PasswordChangedScreen: React.FC = () => {
	const router = useRouter();

	const navigateToLogin = () => {
		router.navigate("/screens/LoginScreen");
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					{/* <Text style={styles.logoText}>Logo</Text> */}
				</View>
				<Text style={styles.title}>Password Changed!</Text>
				<Text style={styles.instructionText}>
					Your password has been changed successfully.
				</Text>
				<View style={styles.buttonContainer}>
					<TouchableOpacity
						style={styles.resendButton}
						onPress={navigateToLogin}
					>
						<Text style={styles.resendButtonText}>BACK TO LOGIN</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		alignItems: "center",
		marginBottom: 250,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	buttonContainer: {
		alignItems: "center",
		width: "100%",
	},
	instructionText: {
		fontSize: 15,
		color: "#888",
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 50,
		paddingHorizontal: 30,
	},
	resendButton: {
		backgroundColor: "#4B0082",
		borderRadius: 25,
		paddingVertical: 15,
		alignItems: "center",
		justifyContent: "center",
		width: "90%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3.84,
		elevation: 5,
		marginBottom: 10,
	},
	resendButtonText: {
		color: "#08BDBD",
		fontSize: 18,
		fontWeight: "bold",
	},
});

export default PasswordChangedScreen;
