import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Alert,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { CheckBox } from "react-native-elements";
import UserPool from "../../services/UserPool";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import CyanButton from "../../components/CyanButton";
import { colors } from '../../styles/colors';

const RegisterScreen: React.FC = () => {
	const [obscureText, setObscureText] = useState(true);
	const [obscureTextConfirm, setObscureTextConfirm] = useState(true);
	const [acceptTerms, setAcceptTerms] = useState(false);
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [emailError, setEmailError] = useState(true);

	const router = useRouter();

	const navigateToLogin = () => {
		router.navigate("/screens/Auth/LoginScreen");
	};

	const validateEmail = (email: string) => {
		const re: RegExp = /\S+@\S+\.\S+/;
		return re.test(email);
	};

	const handleRegister = () => {
		if (password.length < 8) {
			Alert.alert(
				"Password too short",
				"Password should be at least 8 characters long.",
				[{ text: "OK" }],
				{ cancelable: false },
			);
			return;
		}
		if (password !== confirmPassword) {
			Alert.alert(
				"Password Mismatch",
				"The passwords do not match. Please try again.",
				[{ text: "OK" }],
				{ cancelable: false },
			);
			return;
		}

		if (!acceptTerms) {
			Alert.alert(
				"Terms and Conditions",
				"You need to accept the terms and conditions to register.",
				[{ text: "OK" }],
				{ cancelable: false },
			);
			return;
		}

		if (emailError) {
			Alert.alert(
				"Invalid Email",
				"Please enter a valid email address",
				[{ text: "OK" }],
				{ cancelable: false },
			);
			return;
		}

		let username = email;
		let attributes = [];

		if (validateEmail(email)) {
			attributes = [
				new CognitoUserAttribute({
					Name: "email",
					Value: email,
				}),
			];
		}

		console.log(username, password, attributes);
		UserPool.signUp(email, password, null, [], (err, data) => {
			if (err) {
				Alert.alert("Error", err.message, [{ text: "OK" }], {
					cancelable: false,
				});
				router.navigate("/screens/RegisterScreen");
				return;
			}

			Alert.alert(
				"Verification code sent",
				"Please check your Email for the verification code",
				[{ text: "OK" }],
				{ cancelable: false },
			);

			router.navigate({
				pathname: "/screens/VerifyEmail",
				params: { email: email },
			});
		});
	};

	return (
		<ScrollView style={styles.container}>
			<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
				<Ionicons name="chevron-back" size={30} color="black" />
			</TouchableOpacity>
			<View style={styles.logoContainer}>{/* Add Logo Component Here */}</View>
			<Text style={styles.headerText}>
				Join the Fastest Growing Listening Community
			</Text>
			<View style={styles.formContainer}>
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Username</Text>
					<TextInput
						style={styles.input}
						value={username}
						onChangeText={(text) => {
							setUsername(text);
						}}
						placeholder="Create a new username"
					/>
				</View>
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Email</Text>
					<TextInput
						style={styles.input}
						value={email}
						onChangeText={(text) => {
							setEmail(text);
							setEmailError(!validateEmail(text));
						}}
						placeholder="Enter your email"
					/>
				</View>
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Password</Text>
					<View style={styles.passwordContainer}>
						<TextInput
							style={styles.passwordInput}
							value={password}
							onChangeText={setPassword}
							placeholder="*********"
							secureTextEntry={obscureText}
						/>
						<TouchableOpacity
							style={styles.visibilityToggle}
							onPress={() => setObscureText(!obscureText)}
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
					<Text style={styles.label}>Confirm Password</Text>
					<View style={styles.passwordContainer}>
						<TextInput
							style={styles.passwordInput}
							value={confirmPassword}
							onChangeText={setConfirmPassword}
							placeholder="*********"
							secureTextEntry={obscureTextConfirm}
						/>
						<TouchableOpacity
							style={styles.visibilityToggle}
							onPress={() => setObscureTextConfirm(!obscureTextConfirm)}
						>
							<MaterialIcons
								name={obscureTextConfirm ? "visibility-off" : "visibility"}
								size={24}
								color="gray"
							/>
						</TouchableOpacity>
					</View>
				</View>
				<View style={styles.inputGroup}>
					<CheckBox
						containerStyle={styles.checkboxContainer}
						title="Accept Terms and Conditions"
						checked={acceptTerms}
						onPress={() => setAcceptTerms(!acceptTerms)}
					/>
				</View>
				<CyanButton title="REGISTER" onPress={handleRegister} />
			</View>
			<TouchableOpacity 
				style={styles.loginLink} 
				onPress={navigateToLogin}
			>
				<Text style={styles.loginLinkText}>
					Already have an account?{" "}
					<Text style={styles.loginLinkBold}>Login</Text>
				</Text>
			</TouchableOpacity>
			<View style={styles.bottomSpacer} />
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	backButton: {
		position: "absolute",
		top: 16,
		left: 16,
		zIndex: 10,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	headerText: {
		padding: 16,
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 40,
	},
	formContainer: {
		alignItems: "center",
		width: "100%",
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
	input: {
		padding: 12,
		borderBottomWidth: 1,
		borderBottomColor: "gray",
		width: "100%",
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
	visibilityToggle: {
		position: "absolute",
		right: 12,
	},
	checkboxContainer: {
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
	},		
	loginLink: {
		marginTop: 20,
	},
	loginLinkText: {
		fontSize: 16,
		textAlign: "center",
		fontWeight: 500,
	},
	loginLinkBold: {
		fontWeight: "bold",
		color: colors.primary,
	},
	bottomSpacer: {
		marginBottom: 40,
	},
});

export default RegisterScreen;
