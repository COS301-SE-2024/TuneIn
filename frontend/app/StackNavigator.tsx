import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import WelcomeScreen from "./screens/WelcomeScreen";
import RoomPage from "../app/screens/rooms/RoomPage"; // Ensure the path is correct

const Stack = createStackNavigator();

const StackNavigator: React.FC = () => {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Welcome">
				<Stack.Screen name="Welcome" component={WelcomeScreen} />
				<Stack.Screen name="Room" component={RoomPage} />
			</Stack.Navigator>
		</NavigationContainer>
	);
};

export default StackNavigator;
