import { Stack } from "expo-router";
import { PlayerContextProvider } from "./PlayerContext";
import TopNavBar from "../app/components/TopNavBar"; // Adjust the import path as needed

const Layout = () => {
	return (
		<PlayerContextProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen
					name="screens/Home"
					options={{
						title: "Home",
						header: () => <TopNavBar />,
					}}
				/>
				<Stack.Screen
					name="screens/rooms/RoomPage"
					options={{ title: "Room", headerShown: false }}
				/>
			</Stack>
		</PlayerContextProvider>
	);
};

export default Layout;
