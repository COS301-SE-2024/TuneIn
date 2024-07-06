import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const VerifyEmailScreen: React.FC = () => {
	const router = useRouter();

	const [verificationCode, setVerificationCode] = useState([
		"",
		"",
		"",
		"",
		"",
		"",
	]);

	const handleCodeChange = (value: string, index: number) => {
		let codeArray = [...verificationCode];
		codeArray[index] = value;
		setVerificationCode(codeArray);
	};

	const verifyCode = () => {
		const code = verificationCode.join("");

		// Placeholder logic for verifying the code
		if (code === "123456") {
			navigateToNewPassword();
		} else {
			navigateToIncorrectCode();
		}
	};

	const navigateToIncorrectCode = () => {
		router.navigate("/screens/IncorrectCode");
	};

	const navigateToNewPassword = () => {
		router.navigate("/screens/NewPassword");
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
				<View style={styles.header}>
					{/* <Text style={styles.logoText}>Logo</Text> */}
				</View>
				<Text style={styles.title}>OTP Verification</Text>
				<Text style={styles.instructionText}>
					Don't worry! It happens. Please enter the verification code sent to
					your email address.
				</Text>
				<View style={styles.inputContainer}>
					<View style={styles.codeContainer}>
						{verificationCode.map((char, index) => (
							<TextInput
								key={index}
								style={styles.codeInput}
								value={char}
								onChangeText={(value) => handleCodeChange(value, index)}
								keyboardType="numeric"
								maxLength={1}
							/>
						))}
					</View>
					<TouchableOpacity style={styles.verifyButton} onPress={verifyCode}>
						<Text style={styles.verifyButtonText}>VERIFY</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.registerContainer}>
						<Text style={styles.registerText}>
							Didn’t receive code?{" "}
							<Text style={styles.registerBoldText}>Resend</Text>
						</Text>
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
		marginBottom: 100,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
	},
	instructionText: {
		fontSize: 14,
		color: "#888",
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 50,
		paddingHorizontal: 30,
	},
	inputContainer: {
		alignItems: "center",
		width: "100%",
	},
	codeContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "90%",
		marginBottom: 50,
	},
	codeInput: {
		width: 40,
		height: 60,
		borderColor: "gray",
		borderWidth: 1,
		borderRadius: 8,
		textAlign: "center",
		fontSize: 18,
	},
	bottomContainer: {
		alignItems: "center",
		marginBottom: 20,
		justifyContent: "flex-end",
		flex: 1,
	},
	verifyButton: {
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
	verifyButtonText: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "bold",
	},
	registerContainer: {
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

export default VerifyEmailScreen;
