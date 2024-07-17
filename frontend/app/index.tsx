import React from "react";
import { Slot } from "expo-router";
import { PlayerContextProvider } from "./PlayerContext";
import WelcomeScreen from "./screens/WelcomeScreen";

const App: React.FC = () => {
	return (
		<PlayerContextProvider>
			<WelcomeScreen />
		</PlayerContextProvider>
	);
};

export default App;
