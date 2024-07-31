import React from "react";
import { Slot } from "expo-router";
import { PlayerContextProvider } from "./PlayerContext";
import * as Font from "expo-font";
import WelcomeScreen from "../app/screens/WelcomeScreen";

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

const App: React.FC = () => {
	return (
		<PlayerContextProvider>
			<WelcomeScreen />
		</PlayerContextProvider>
	);
};

export default App;
