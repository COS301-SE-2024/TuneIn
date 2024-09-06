import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Home from "./screens/(tabs)/Home";
import Search from "./screens/(tabs)/Search";
import Help from "./screens/(tabs)/HelpScreen";
import RoomPage from "../app/screens/rooms/RoomPage";
const Tab = createBottomTabNavigator();

const TabGroup = () => (
	<Tab.Navigator>
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
