import React from "react";
import StackNavigator from "./StackNavigator";
import { PlayerContextProvider } from "./PlayerContext";

const App: React.FC = () => {
	return (
		<PlayerContextProvider>
			<StackNavigator />
		</PlayerContextProvider>
	);
};

export default App;
