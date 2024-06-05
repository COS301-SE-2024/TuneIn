import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Home from './app/screens/Home'; // Ensure this path is correct
import RoomPage from './app/screens/RoomPage'; // Ensure this path is correct

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="RoomPage" component={RoomPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
