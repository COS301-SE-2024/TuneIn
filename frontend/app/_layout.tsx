import { Stack } from "expo-router";
import { PlayerContextProvider } from "./PlayerContext";

const Layout = () => {
	return (
		<PlayerContextProvider>
			<Stack>
				<Stack.Screen name="index" options={{ title: "Welcome" }} />
				<Stack.Screen name="auth/login" options={{ title: "Login" }} />
				<Stack.Screen name="room" options={{ title: "Room" }} />
			</Stack>
		</PlayerContextProvider>
	);
};

export default Layout;
