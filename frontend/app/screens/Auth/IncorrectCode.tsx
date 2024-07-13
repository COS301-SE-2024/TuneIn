import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const IncorrectCodeScreen: React.FC = () => {
	const router = useRouter();

	const navigateToOTP = () => {
		router.navigate("/screens/OTP");
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<TouchableOpacity onPress={() => router.back()} testID="back-button">
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<View style={styles.header}>
					{/* <Text style={styles.logoText}>Logo</Text> */}
				</View>
				<Text style={styles.title}>Verification Code Incorrect</Text>
				<Text style={styles.instructionText}>
					Would you like us to send you a new code?
				</Text>
				<View style={styles.buttonContainer}>
					<TouchableOpacity style={styles.resendButton} onPress={navigateToOTP}>
						<Text style={styles.resendButtonText}>RESEND CODE</Text>
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
		marginBottom: 200,
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
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
});

export default IncorrectCodeScreen;
