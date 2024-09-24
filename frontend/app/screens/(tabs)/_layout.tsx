import { Tabs } from "expo-router";
import { colors } from "../../styles/colors";
import { Ionicons } from "@expo/vector-icons";

const AppTabs = () => {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: colors.primary,
				tabBarLabelStyle: { fontSize: 12, marginTop: 4 },
				tabBarStyle: {
					height: 60,
					paddingBottom: 5,
					paddingTop: 5,
				},
				tabBarHideOnKeyboard: true,
			}}
		>
			<Tabs.Screen
				name="Home"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<Ionicons size={26} name="home-sharp" color={color} />
					),
					tabBarLabel: "Home",
				}}
			/>
			<Tabs.Screen
				name="Search"
				options={{
					title: "Search",
					tabBarIcon: ({ color }) => (
						<Ionicons size={26} name="search-sharp" color={color} />
					),
					tabBarLabel: "Search",
				}}
			/>
			<Tabs.Screen
				name="HelpScreen"
				options={{
					title: "HelpScreen",
					tabBarIcon: ({ color }) => (
						<Ionicons size={28} name="help-circle-sharp" color={color} />
					),
					tabBarLabel: "Help",
				}}
			/>
		</Tabs>
	);
};

AppTabs.displayName = "AppTabs";

export default AppTabs;
