import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "../app/screens/(tabs)/Home";
import Search from "../app/screens/(tabs)/Search";
import Help from "../app/screens/(tabs)/HelpScreen";
const Tab = createBottomTabNavigator();

const TabGroup = () => (
	<Tab.Navigator>
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
