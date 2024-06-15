import React from "react";
import {
	View,
	Text,
	ImageBackground,
	TouchableOpacity,
	Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

const WelcomeScreen: React.FC = () => {
	const router = useRouter();
	const { width, height } = Dimensions.get("window");

	const navigateToLogin = () => {
		router.navigate("/screens/LoginScreen");
	};

	const navigateToRegister = () => {
		router.navigate("/screens/RegisterScreen");
	};

	return (
		<View className="flex-1 justify-center">
			<ImageBackground
				source={require("../../assets/text.jpg")}
				style={{ width, height: height * 0.5 }}
				resizeMode="cover"
			/>
			<View className="flex-1 justify-center items-center p-4">
				<Text className="text-lg font-bold mb-5">Logo</Text>
				<Text className="text-2xl font-bold mb-8">TuneIn</Text>
				<TouchableOpacity
					className="w-11/12 h-12 justify-center items-center bg-indigo-700 rounded-full mb-5 shadow-lg"
					onPress={navigateToLogin}
				>
					<Text className="text-lg font-bold text-white">Login</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className="w-11/12 h-12 justify-center items-center bg-white-700 border border-black rounded-full mb-5 shadow-lg"
					onPress={navigateToRegister}
				>
					<Text className="text-lg font-bold text-black">Register</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

export default WelcomeScreen;
