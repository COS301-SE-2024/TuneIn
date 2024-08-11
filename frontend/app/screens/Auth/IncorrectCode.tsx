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
import CyanButton from "../../components/CyanButton";
import { colors } from "../../styles/colors";

const IncorrectCodeScreen: React.FC = () => {
	const router = useRouter();

	const navigateToOTP = () => {
		router.navigate("/screens/Auth/OTP");
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
					<CyanButton title="RESEND CODE" onPress={navigateToOTP} />
				</View>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 30,
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
		fontSize: 16,
		color: colors.primary,
		fontWeight: "500",
		textAlign: "center",
		marginBottom: 50,
		paddingHorizontal: 30,
	},
});

export default IncorrectCodeScreen;
