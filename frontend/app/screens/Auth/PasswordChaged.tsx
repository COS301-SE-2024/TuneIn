import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import CyanButton from "../../components/CyanButton";
import { colors } from "../../styles/colors";

const PasswordChangedScreen: React.FC = () => {
	const router = useRouter();

	const navigateToLogin = () => {
		router.navigate("/screens/Auth/LoginScreen");
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
					<CyanButton title="BACK TO LOGIN" onPress={navigateToLogin} />
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
		fontSize: 16,
		color: colors.primary,
		fontWeight: "500",
		textAlign: "center",
		marginBottom: 50,
		paddingHorizontal: 30,
	},
});

export default PasswordChangedScreen;
