import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	ScrollView,
	Alert,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { CheckBox } from "react-native-elements";
import * as StorageService from "../../services/StorageService";
import UserPool from "../../services/UserPool";
import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import CyanButton from "../../components/CyanButton";
import { colors } from "../../styles/colors";

const LoginScreen: React.FC = () => {
	StorageService.clear();

	const [obscureText, setObscureText] = useState(true);
	const [rememberMe, setRememberMe] = useState(false);
	const [emailOrUsername, setEmailOrUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const router = useRouter();

	const navigateToHome = () => {
		setIsLoading(true);

		const userData = {
			Username: emailOrUsername,
			Pool: UserPool,
		};

		const cognitoUser = new CognitoUser(userData);
		const authenticationData = {
			Username: emailOrUsername,
			Password: password,
		};

		const authenticationDetails = new AuthenticationDetails(authenticationData);
		cognitoUser.authenticateUser(authenticationDetails, {
			onSuccess: function (result) {
				// Store token in storage if remember me is checked
				if (rememberMe) {
					StorageService.setItem(
						"cognitoToken",
						result.getAccessToken().getJwtToken(),
					);
				}
				auth.exchangeCognitoToken(result.getIdToken().getJwtToken());
				router.navigate("/screens/Home");
				setIsLoading(false);
			},
			onFailure: function (err) {
				console.error("Authentication failed:", err);
				setIsLoading(false);
				Alert.alert(err.message);
			},
		});
	};

	const navigateToRegister = () => {
		router.navigate("/screens/Auth/RegisterScreen");
	};

	const navigateToForgot = () => {
		router.navigate("/screens/Auth/ForgotPassword");
	};

	return (
		<ScrollView style={styles.container}>
			<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
				<Ionicons name="chevron-back" size={30} color="black" />
			</TouchableOpacity>
			<View style={styles.logoContainer}>
				{/* <Text style={styles.logoText}>Logo</Text> */}
			</View>
			<Text style={styles.headerText}>Welcome Back to TuneIn</Text>
			<View style={styles.formContainer}>
				<View style={styles.inputGroup}>
					<Text style={styles.label}>Email or Username</Text>
					<TextInput
						style={styles.input}
						value={emailOrUsername}
						onChangeText={setEmailOrUsername}
						placeholder="Enter your email or username"
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
				<TouchableOpacity
					style={styles.forgotPasswordButton}
					onPress={navigateToForgot}
				>
					<Text style={styles.forgotPasswordText}>Forgot Password?</Text>
				</TouchableOpacity>
				<View style={styles.inputGroup}>
					<CheckBox
						containerStyle={styles.checkboxContainer}
						title="Remember Me"
						checked={rememberMe}
						onPress={() => setRememberMe(!rememberMe)}
					/>
				</View>
				{isLoading ? (
					<ActivityIndicator size="small" color="#08BDBD" />
				) : (
					<CyanButton title="LOGIN" onPress={navigateToHome} />
				)}

				<TouchableOpacity
					style={styles.registerLink}
					onPress={navigateToRegister}
				>
					<Text style={styles.registerLinkText}>
						Don’t have an account?{" "}
						<Text style={styles.registerLinkBold}>Register Now</Text>
					</Text>
				</TouchableOpacity>
			</View>
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
		padding: 20,
		fontSize: 32,
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
	forgotPasswordButton: {
		alignSelf: "flex-end",
		marginRight: 16,
	},
	forgotPasswordText: {
		color: "black",
	},
	checkboxContainer: {
		backgroundColor: "transparent",
		borderWidth: 0,
		padding: 0,
	},
	registerLink: {
		marginTop: 20,
	},
	registerLinkText: {
		fontSize: 16,
		textAlign: "center",
		fontWeight: 500,
	},
	registerLinkBold: {
		fontWeight: "bold",
		color: colors.primary,
	},
});

export default LoginScreen;
