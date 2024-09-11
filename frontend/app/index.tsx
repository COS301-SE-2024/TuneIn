import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import WelcomeScreen from "./screens/WelcomeScreen";
import * as StorageService from "./services/StorageService";
import auth from "./services/AuthManagement";
import { live } from "./services/Live";
import * as Font from "expo-font";
import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { PlayerContextProvider } from "./PlayerContext";
import "../polyfills";
import { APIProvider } from "./APIContext";

const fetchFonts = () => {
	return Font.loadAsync({
		"Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
		"Poppins-BlackItalic": require("../assets/fonts/Poppins-BlackItalic.ttf"),
		"Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
		"Poppins-BoldItalic": require("../assets/fonts/Poppins-BoldItalic.ttf"),
		"Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
		"Poppins-ExtraBoldItalic": require("../assets/fonts/Poppins-ExtraBoldItalic.ttf"),
		"Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
		"Poppins-ExtraLightItalic": require("../assets/fonts/Poppins-ExtraLightItalic.ttf"),
		"Poppins-Italic": require("../assets/fonts/Poppins-Italic.ttf"),
		"Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
		"Poppins-LightItalic": require("../assets/fonts/Poppins-LightItalic.ttf"),
		"Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
		"Poppins-MediumItalic": require("../assets/fonts/Poppins-MediumItalic.ttf"),
		"Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
		"Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
		"Poppins-SemiBoldItalic": require("../assets/fonts/Poppins-SemiBoldItalic.ttf"),
		"Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
		"Poppins-ThinItalic": require("../assets/fonts/Poppins-ThinItalic.ttf"),
	});
};

if (Platform.OS === "web") {
	console.log(WebBrowser.maybeCompleteAuthSession());
}

const App: React.FC = () => {
	const router = useRouter();
	const [, setIsCheckingToken] = useState(true);
	const [, setFontLoaded] = useState(false);

	useEffect(() => {
		const checkTokenAndLoadFonts = async () => {
			try {
				await fetchFonts();
				setFontLoaded(true);

				const cognitoToken = await StorageService.getItem("cognitoToken");
				if (cognitoToken) {
					auth.exchangeCognitoToken(cognitoToken, live.initialiseSocket, true);
				}

				if (!auth.tokenSet) {
					const authToken = await StorageService.getItem("token");
					if (authToken && authToken !== "undefined" && authToken !== "null") {
						auth.setToken(authToken);
						live.initialiseSocket();
					}
				}

				if (auth.authenticated()) {
					// Redirect to HomeScreen and replace the current route
					router.replace("/screens/Home");
				} else {
					// Redirect to WelcomeScreen and replace the current route
					console.log("clearing from index");
					StorageService.clear();
					router.replace("/screens/WelcomeScreen");
				}
			} catch (error) {
				console.error("Error checking token or loading fonts:", error);
				router.replace("/screens/WelcomeScreen");
			} finally {
				setIsCheckingToken(false);
			}
		};

		checkTokenAndLoadFonts();
	}, [router]);

	return (
		<APIProvider>
			<PlayerContextProvider>
				<WelcomeScreen />
			</PlayerContextProvider>
		</APIProvider>
	);
};

export default App;
