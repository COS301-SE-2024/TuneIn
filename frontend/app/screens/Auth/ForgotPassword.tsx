import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CyanButton from "../../components/CyanButton";
import { colors } from "../../styles/colors";
import { CognitoUser } from "amazon-cognito-identity-js";
import UserPool from "../../services/UserPool";
import * as StorageService from "../../services/StorageService";

const ForgotPasswordScreen: React.FC = () => {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [emailError, setEmailError] = useState(true);

	const userData = {
		Username: email,
		Pool: UserPool,
	};

	const cognitoUser = new CognitoUser(userData);

	const validateEmail = (email: string) => {
		const re: RegExp = /\S+@\S+\.\S+/;
		return re.test(email);
	};

	const handleSendCode = () => {
		if (emailError) {
			Alert.alert(
				"Invalid Email",
				"Please enter a valid email address",
				[{ text: "OK" }],
				{ cancelable: false },
			);
			return;
		}

		Alert.alert(
			"Confirm Email",
			`Is this the correct email address? ${email}`,
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "OK",
					onPress: () => {
						StorageService.clear();
						cognitoUser.forgotPassword({
							onSuccess: () => {
								router.push({
									pathname: "screens/Auth/ResetPassword",
									params: { email: email },
								});
							},
							onFailure: (err) => {
								console.log("Error sending reset code:", err);
							},
						});
					},
				},
			],
			{ cancelable: false },
		);
	};

	const navigateToLogin = () => {
		StorageService.clear();
		router.push("screens/Auth/LoginScreen");
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} testID="back-button">
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
			</View>

			<Text style={styles.welcomeText}>Forgot Password?</Text>
			<Text style={styles.instructionText}>
				Don't worry! It happens. Please enter your email address to receive a
				verification code.
			</Text>

			<TextInput
				style={styles.input}
				placeholder="Enter your email"
				value={email}
				placeholderTextColor="#888"
				keyboardType="email-address"
				autoCapitalize="none"
				onChangeText={(text) => {
					setEmail(text);
					setEmailError(!validateEmail(text));
				}}
			/>

			<View style={styles.bottomContainer}>
				<CyanButton title="Send Code" onPress={handleSendCode} />

				<TouchableOpacity
					style={styles.registerContainer}
					onPress={navigateToLogin}
				>
					<Text style={styles.registerText}>
						Remember Password?{" "}
						<Text style={styles.registerBoldText}>Login</Text>
					</Text>
				</TouchableOpacity>
			</View>
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
		textAlign: "center",
		marginTop: 50,
		marginBottom: 20,
		paddingHorizontal: 20,
	},
	instructionText: {
		fontSize: 16,
		color: colors.primary,
		textAlign: "center",
		marginBottom: 20,
		paddingHorizontal: 30,
		fontWeight: "500",
	},
	input: {
		height: 50,
		borderBottomColor: "#888",
		borderBottomWidth: 1,
		marginHorizontal: 30, // Add horizontal margin
		fontSize: 16,
		marginBottom: 10,
	},
	bottomContainer: {
		position: "absolute",
		bottom: 40,
		left: 0,
		right: 0,
		paddingHorizontal: 16,
		alignItems: "center",
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

export default ForgotPasswordScreen;
