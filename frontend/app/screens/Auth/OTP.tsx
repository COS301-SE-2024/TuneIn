import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CyanButton from "../../components/CyanButton";
import { colors } from "../../styles/colors";

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
		router.navigate("/screens/Auth/IncorrectCode");
	};

	const navigateToNewPassword = () => {
		router.navigate("/screens/Auth/NewPassword");
	};

	return (
		<View style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={30} color="black" />
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
					<CyanButton title="VERIFY" onPress={verifyCode} />
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
		fontSize: 16,
		color: colors.primary,
		fontWeight: "500",
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
	registerContainer: {
		alignItems: "center",
	},
	registerText: {
		fontSize: 16,
		color: "#000",
		fontWeight: "500",
	},
	registerBoldText: {
		fontWeight: "bold",
		color: colors.primary,
	},
});

export default VerifyEmailScreen;
