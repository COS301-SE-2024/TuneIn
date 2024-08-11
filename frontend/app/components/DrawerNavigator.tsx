import React from "react";
import { View } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import AnalyticsPage from "../screens/analytics/AnalyticsPage";
import InteractionsAnalytics from "../screens/analytics/InteractionsAnalytics";
import GeneralAnalytics from "../screens/analytics/GeneralAnalytics";
import PlaylistAnalytics from "../screens/analytics/PlaylistAnalytics";

const Drawer = createDrawerNavigator();

const DrawerNavigator: React.FC = () => {
	return (
		<View testID="drawer-navigator-container">
			<NavigationContainer>
				<Drawer.Navigator>
					<Drawer.Screen
						name="AnalyticsPage"
						component={AnalyticsPage}
						options={{ title: "AnalyticsPage" }}
					/>
					<Drawer.Screen
						name="InteractionsAnalytics"
						component={InteractionsAnalytics}
						options={{ title: "InteractionsAnalytics" }}
					/>
					<Drawer.Screen
						name="GeneralAnalytics"
						component={GeneralAnalytics}
						options={{ title: "GeneralAnalytics" }}
					/>
					<Drawer.Screen
						name="PlaylistAnalytics"
						component={PlaylistAnalytics}
						options={{ title: "PlaylistAnalytics" }}
					/>
				</Drawer.Navigator>
			</NavigationContainer>
		</View>
	);
};

export default DrawerNavigator;
