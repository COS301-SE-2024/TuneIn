import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabGroup from "../app/";
import RoomPage from "../app/screens/rooms/RoomPage";
import EditRoom from "../app/screens/rooms/EditRoom";

const Stack = createNativeStackNavigator();

const HomeStackGroup = () => (
	<Stack.Navigator>
		<Stack.Screen
			name="TabGroup"
			component={TabGroup}
			options={{ headerShown: false }}
		/>
		<Stack.Screen name="RoomPage" component={RoomPage} />
		<Stack.Screen name="EditRoom" component={EditRoom} />
	</Stack.Navigator>
);

export default HomeStackGroup;
