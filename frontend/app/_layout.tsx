import { Stack } from "expo-router";
import { PlayerContextProvider } from "./PlayerContext";
import { StatusBar } from "react-native";
import TopNavBar from "../app/components/TopNavBar";
import { colors } from "../app/styles/colors";

const Layout = () => {
	return (
		<PlayerContextProvider>
			<StatusBar
				barStyle="light-content"
				backgroundColor={colors.backgroundColor}
			/>
			<Stack screenOptions={{ title: "Room", headerShown: false }}>
				<Stack.Screen name="screens/Home" />
				<Stack.Screen
					name="screens/rooms/RoomPage"
					options={{ title: "Room", headerShown: false }}
				/>
			</Stack>
		</PlayerContextProvider>
	);
};

export default Layout;
