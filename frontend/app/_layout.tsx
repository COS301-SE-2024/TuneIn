import { Stack } from "expo-router";
import { PlayerContextProvider } from "./PlayerContext";
import { StatusBar, SafeAreaView, StyleSheet } from "react-native";
import { colors } from "../app/styles/colors";
import { APIProvider } from "./APIContext";
import { LiveProvider } from "./LiveContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

const Layout = () => {
	return (
		<APIProvider>
			<LiveProvider>
				<PlayerContextProvider>
					<SafeAreaProvider>
						<StatusBar
							barStyle="dark-content"
							backgroundColor={colors.backgroundColor}
						/>
						<SafeAreaView style={styles.container}>
							<Stack screenOptions={{ title: "Room", headerShown: false }}>
								<Stack.Screen name="screens/(tabs)" />
							</Stack>
						</SafeAreaView>
					</SafeAreaProvider>
				</PlayerContextProvider>
			</LiveProvider>
		</APIProvider>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingTop: 25,
		flex: 1,
	},
});

export default Layout;
