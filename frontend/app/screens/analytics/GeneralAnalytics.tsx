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

const LoginScreen: React.FC = () => {
	const router = useRouter();

	return (
		<ScrollView style={styles.container}>
			<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
				<Ionicons name="chevron-back" size={30} color="black" />
			</TouchableOpacity>
			<View style={styles.logoContainer}>
				{/* <Text style={styles.logoText}>Logo</Text> */}
			</View>
			<Text style={styles.headerText}>General and Room Analytics</Text>
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
});

export default LoginScreen;
