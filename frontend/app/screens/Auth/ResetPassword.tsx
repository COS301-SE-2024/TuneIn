import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import CyanButton from "../../components/CyanButton";
import { colors } from "../../styles/colors";
import { CognitoUser } from "amazon-cognito-identity-js";
import UserPool from "../../services/UserPool";
import * as StorageService from "../../services/StorageService";

const PasswordReset: React.FC = () => {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [resetcode, setResetcode] = useState("");
	const [obscureText, setObscureText] = useState(true);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [obscureTextConfirm, setObscureTextConfirm] = useState(true);
	const { email } = useLocalSearchParams(); // Accessing the email passed from RegisterScreen

	const handleConfirmPasswordReset = () => {
		const userData = {
			Username: String(email),
			Pool: UserPool,
		};

		const cognitoUser = new CognitoUser(userData);
		cognitoUser.confirmPassword(resetcode, confirmPassword, {
			onSuccess: () => {
				Alert.alert("Password reset");
				router.push("screens/Auth/LoginScreen");
			},
			onFailure: () => {
				Alert.alert(
					"Password reset failed",
					"Please Try again.",
					[{ text: "OK" }],
					{ cancelable: false },
				);
				return;
			},
		});
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()} testID="back-button">
					<Ionicons name="chevron-back" size={30} color="black" />
				</TouchableOpacity>
			</View>

			<Text style={styles.welcomeText}>Password Reset</Text>
			<View style={styles.inputGroup}>
				<Text style={styles.instructionText}>
					Please enter the verification code sent to your email address.
				</Text>
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Verification code</Text>
					<View style={styles.passwordContainer}>
						<TextInput
							style={styles.passwordInput}
							placeholder="12345"
							value={resetcode}
							onChangeText={setResetcode}
							placeholderTextColor="#888"
							testID="verification-code-input"
						/>
					</View>
				</View>
			</View>
			<View style={styles.inputGroup}>
				<Text style={styles.label}>New Password</Text>
				<View style={styles.passwordContainer}>
					<TextInput
						style={styles.passwordInput}
						value={password}
						onChangeText={setPassword}
						placeholder="*********"
						secureTextEntry={obscureText}
						testID="new-password-input"
					/>
					<TouchableOpacity
						style={styles.visibilityToggle}
						onPress={() => setObscureText(!obscureText)}
						testID="new-password-visibility-toggle"
					>
						<MaterialIcons
							name={obscureText ? "visibility-off" : "visibility"}
							size={24}
							color="gray"
						/>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.inputGroup}>
				<Text style={styles.label}>Confirm new Password</Text>
				<View style={styles.passwordContainer}>
					<TextInput
						style={styles.passwordInput}
						value={confirmPassword}
						onChangeText={setConfirmPassword}
						placeholder="*********"
						secureTextEntry={obscureTextConfirm}
						testID="confirm-password-input"
					/>
					<TouchableOpacity
						style={styles.visibilityToggle}
						onPress={() => setObscureTextConfirm(!obscureTextConfirm)}
						testID="confirm-password-visibility-toggle"
					>
						<MaterialIcons
							name={obscureTextConfirm ? "visibility-off" : "visibility"}
							size={24}
							color="gray"
						/>
					</TouchableOpacity>
				</View>
			</View>
			<View style={styles.bottomContainer}>
				<CyanButton
					title="Confirm Reset"
					onPress={handleConfirmPasswordReset}
				/>
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
	visibilityToggle: {
		position: "absolute",
		right: 12,
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
	inputGroup: {
		width: "92%",
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 8,
		color: colors.primary,
	},
	passwordContainer: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
	},
	passwordInput: {
		flex: 1,
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: "gray",
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

export default PasswordReset;
