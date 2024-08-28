// CustomTopNavBar.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { Entypo } from "@expo/vector-icons"; // Make sure to install the icon library: expo install @expo/vector-icons

interface CustomTopNavBarProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

const CustomTopNavBar: React.FC<CustomTopNavBarProps> = ({
	activeTab,
	setActiveTab,
}) => {
	const navigation = useNavigation<NavigationProp<any>>();

	return (
		<View style={styles.topBarContainer}>
			{/* Back Button */}
			<TouchableOpacity
				onPress={() => navigation.goBack()}
				style={styles.backButton}
				testID="backButton"
			>
				<Entypo name="chevron-left" size={24} color="black" />
			</TouchableOpacity>

			{/* Tabs */}
			<View style={styles.tabBarContainer}>
				{["Chat", "Room", "Queue"].map((tab) => (
					<TouchableOpacity
						key={tab}
						onPress={() => setActiveTab(tab)}
						style={styles.tabButton}
					>
						<Text
							style={[
								styles.tabLabel,
								activeTab === tab ? styles.activeTab : styles.inactiveTab,
							]}
						>
							{tab}
						</Text>
						{activeTab === tab && <View style={styles.activeIndicator} />}
					</TouchableOpacity>
				))}
			</View>

			{/* Menu Icon */}
			<TouchableOpacity
				onPress={() => console.log("Menu pressed")}
				style={styles.menuButton}
			>
				<Entypo name="dots-three-vertical" size={20} color="black" />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	topBarContainer: {
		flexDirection: "row",
		alignItems: "center",
		height: 60,
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		paddingHorizontal: 10,
	},
	backButton: {
		paddingRight: 20,
	},
	tabBarContainer: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		flex: 1,
	},
	tabButton: {
		alignItems: "center",
		justifyContent: "center",
	},
	tabLabel: {
		fontSize: 16,
	},
	activeTab: {
		color: "black",
		fontWeight: "bold",
	},
	inactiveTab: {
		color: "grey",
	},
	activeIndicator: {
		width: "100%",
		height: 2,
		backgroundColor: "black",
		marginTop: 4,
	},
	menuButton: {
		paddingLeft: 20,
	},
});

export default CustomTopNavBar;
