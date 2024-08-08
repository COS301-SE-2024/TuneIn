// DrawerNavigator.tsx
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import AnalyticsPage from "../screens/analytics/AnalyticsPage";
import InteractionsAnalytics from "../screens/analytics/InteractionsAnalytics";
import GeneralAnalytics from "../screens/analytics/GeneralAnalytics";
import PlaylistAnalytics from "../screens/analytics/PlaylistAnalytics";

const Drawer = createDrawerNavigator();

const DrawerNavigator: React.FC = () => {
	return (
		<NavigationContainer>
			<Drawer.Navigator>
				<Drawer.Screen name="AnalyticsPage" component={AnalyticsPage} />
				<Drawer.Screen
					name="InteractionsAnalytics"
					component={InteractionsAnalytics}
				/>
				<Drawer.Screen name="GeneralAnalytics" component={GeneralAnalytics} />
				<Drawer.Screen name="PlaylistAnalytics" component={PlaylistAnalytics} />
			</Drawer.Navigator>
		</NavigationContainer>
	);
};

export default DrawerNavigator;
