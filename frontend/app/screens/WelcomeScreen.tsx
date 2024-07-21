import React from "react";
import {
	View,
	Text,
	ImageBackground,
	TouchableOpacity,
	Dimensions,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CyanButton from "../components/CyanButton";
import WhiteButton from "../components//WhiteButton";

const WelcomeScreen: React.FC = () => {
	const router = useRouter();
	const { width, height } = Dimensions.get("window");

	const navigateToLogin = () => {
		router.navigate("/screens/Auth/LoginScreen");
	};

	const navigateToRegister = () => {
		router.navigate("/screens/Auth/RegisterScreen");
	};

	const navigateToHelp = () => {
		router.navigate("/screens/help/HelpScreen");
	};

	return (
		<View style={styles.container}>
			<ImageBackground
				source={require("../../assets/text.jpg")}
				style={[styles.imageBackground, { width, height: height * 0.5 }]}
				resizeMode="cover"
			>
				<TouchableOpacity style={styles.helpButton} onPress={navigateToHelp}>
					<MaterialCommunityIcons
						name="help-circle-outline"
						size={24}
						color="#FFF"
						style={styles.helpIcon}
					/>
				</TouchableOpacity>
			</ImageBackground>
			<View style={styles.innerContainer}>
				<Text style={styles.logoText}>Logo</Text>
				<Text style={styles.titleText}>TuneIn</Text>
				<CyanButton title="Login" onPress={navigateToLogin} />
				<WhiteButton title="Register" onPress={navigateToRegister} />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
	},
	imageBackground: {
		width: "100%",
		height: "50%",
		position: "relative",
	},
	innerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 16,
	},
	logoText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 20,
	},
	titleText: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 32,
	},
	helpButton: {
		position: "absolute",
		top: 20,
		right: 20,
		backgroundColor: "transparent",
		padding: 10,
	},
	helpIcon: {
		marginRight: 5,
	},
});

export default WelcomeScreen;
