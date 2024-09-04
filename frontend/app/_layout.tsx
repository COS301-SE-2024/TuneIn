import { Stack } from "expo-router";
import { PlayerContextProvider } from "./PlayerContext";
import { StatusBar, View, StyleSheet } from "react-native";
import TopNavBar from "../app/components/TopNavBar";
import { colors } from "../app/styles/colors";
import { APIProvider } from "./APIContext";

const Layout = () => {
	return (
		<APIProvider>
			<PlayerContextProvider>
				<StatusBar
					barStyle="light-content"
					backgroundColor={colors.backgroundColor}
				/>
				<View style={styles.container}>
					<Stack screenOptions={{ title: "Room", headerShown: false }}>
						<Stack.Screen name="screens/Home" />
						<Stack.Screen
							name="screens/rooms/RoomPage"
							options={{ title: "Room", headerShown: false }}
						/>
					</Stack>
				</View>
			</PlayerContextProvider>
		</APIProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 45,
		// backgroundColor: colors.backgroundColor,
	},
});

export default Layout;
