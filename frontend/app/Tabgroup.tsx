import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Home from "../app/screens/Home";
import Search from "../app/screens/Search";
import Help from "../app/screens/help/HelpScreen";
import { colors } from "../app/styles/colors";
import RoomPage from "../app/screens/rooms/RoomPage";
const Tab = createBottomTabNavigator();

const TabGroup = () => (
	<Tab.Navigator
		screenOptions={({ route }) => ({
			tabBarIcon: ({ focused, size, color }) => {
				let iconName;

				switch (route.name) {
					case "Home":
						iconName = focused ? "home" : "home-outline";
						break;
					case "Search":
						iconName = focused ? "search" : "search-outline";
						break;
					case "Help":
						iconName = focused ? "help-circle" : "help-circle-outline";
						break;
					default:
						iconName = "home-outline";
						break;
				}

				return (
					<Ionicons
						name="home"
						size={size}
						color={focused ? colors.primary : "#333"}
					/>
				);
			},
			tabBarStyle: { height: 55, paddingBottom: 10 },
			tabBarActiveTintColor: colors.primary,
			tabBarInactiveTintColor: "#333",
		})}
	>
		{" "}
		<Tab.Screen name="screens/rooms/RoomPage" component={RoomPage} />
		<Tab.Screen
			name="Home"
			component={Home}
			options={{ title: "Home", headerShown: false }}
		/>
		<Tab.Screen
			name="Search"
			component={Search}
			options={{ title: "Search" }}
		/>
		<Tab.Screen name="Help" component={Help} options={{ title: "Help" }} />
	</Tab.Navigator>
);

export default TabGroup;
