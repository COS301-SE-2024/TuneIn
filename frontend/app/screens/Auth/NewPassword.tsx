import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	KeyboardAvoidingView,
	ScrollView,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import CyanButton from "../../components/CyanButton";
import { colors } from "../../styles/colors";

const NewPasswordScreen: React.FC = () => {
	const router = useRouter();
	const [obscureText, setObscureText] = useState(true);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const navigateToPasswordChaged = () => {
		router.navigate("/screens/Auth/PasswordChaged");
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={30} color="black" />
					</TouchableOpacity>
				</View>

				<Text style={styles.welcomeText}>Create a New Password</Text>
				<Text style={styles.instructionText}>
					Your new password must be unique from those previously used.
				</Text>

				<View style={styles.inputWrapper}>
					<Text style={styles.inputLabel}>New Password</Text>
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							placeholder="*********"
							secureTextEntry={obscureText}
							value={password}
							onChangeText={setPassword}
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

				<View style={styles.inputWrapper}>
					<Text style={styles.inputLabel}>Confirm Password</Text>
					<View style={styles.inputContainer}>
						<TextInput
							style={styles.input}
							placeholder="*********"
							secureTextEntry={obscureText}
							value={confirmPassword}
							onChangeText={setConfirmPassword}
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
			</ScrollView>
			<View style={styles.bottomContainer}>
				<CyanButton title="RESET PASSWORD" onPress={navigateToPasswordChaged} />
			</View>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scrollContainer: {
		flexGrow: 1,
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
	inputWrapper: {
		marginHorizontal: 30,
		marginBottom: 20,
	},
	inputLabel: {
		fontSize: 16,
		fontWeight: "bold",
		marginBottom: 10,
		color: colors.primary,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomColor: "gray",
		borderBottomWidth: 1,
	},
	input: {
		flex: 1,
		height: 50,
		fontSize: 16,
	},
	visibilityToggle: {
		padding: 10,
	},
	bottomContainer: {
		paddingHorizontal: 16,
		alignItems: "center",
		paddingVertical: 20,
		backgroundColor: "white",
	},
});

export default NewPasswordScreen;
