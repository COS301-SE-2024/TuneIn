import { Stack } from "expo-router";
import { PlayerContextProvider } from "./PlayerContext";
import { StatusBar } from "react-native";
import TopNavBar from "../app/components/TopNavBar";
import { colors } from "../app/styles/colors";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../app/screens/Home";
import Search from "../app/screens/Search";
import Help from "../app/screens/help/HelpScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

function TabGroup() {
	return (
		<Tab.Navigator
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, size, color }) => {
					let iconName;

					switch (route.name) {
						case "screens/Home":
							iconName = focused ? "home" : "home-outline";
							break;
						case "screens/Search":
							iconName = focused ? "search" : "search-outline";
							break;
						case "screens/help/HelpScreen":
							iconName = focused ? "help-circle" : "help-circle-outline";
							break;
						default:
							iconName = "home-outline"; // Default icon
							break;
					}

					return (
						<Ionicons
							name={iconName}
							size={size}
							color={focused ? colors.primary : "#333"}
						/>
					);
				},
				tabBarStyle: {
					height: 55,
					paddingBottom: 10,
				},
				tabBarActiveTintColor: colors.primary,
				tabBarInactiveTintColor: "#333",
			})}
		>
			<Tab.Screen
				name="screens/Home"
				component={Home}
				options={{ title: "Home" }}
			/>
			<Tab.Screen
				name="screens/Search"
				component={Search}
				options={{ title: "Search" }}
			/>
			<Tab.Screen
				name="screens/help/HelpScreen"
				component={Help}
				options={{ title: "Help" }}
			/>
		</Tab.Navigator>
	);
}

const Layout = () => {
	return (
		<PlayerContextProvider>
			<StatusBar
				barStyle="light-content"
				backgroundColor={colors.backgroundColor}
			/>
			<TabGroup />
		</PlayerContextProvider>
	);
};

export default Layout;