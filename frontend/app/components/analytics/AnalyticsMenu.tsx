import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

// Define the prop types using an interface
interface AnalyticsMenuProps {
	isVisible: boolean;
	onClose: () => void;
}

const AnalyticsMenu: React.FC<AnalyticsMenuProps> = ({
	isVisible,
	onClose,
}) => {
	// Navigation functions
	const navigateToGeneralAnalytics = () => {
		router.push("/screens/analytics/GeneralAnalytics");
		onClose(); // Close the modal after navigation
	};

	const navigateToInteractionsAnalytics = () => {
		router.navigate({
			pathname: "/screens/analytics/InteractionsAnalytics",
		});
		onClose(); // Close the modal after navigation
	};

	return (
		<Modal transparent visible={isVisible} animationType="fade">
			<TouchableOpacity
				style={styles.overlay}
				onPress={onClose}
				testID="overlay"
			>
				<View style={styles.menuContainer}>
					{/* General Analytics Option */}
					<TouchableOpacity
						onPress={navigateToGeneralAnalytics}
						style={styles.menuItem}
					>
						<Text style={styles.menuText}>
							<Ionicons name="bar-chart" size={20} color="black" />
							{"  "}
							General Analytics
						</Text>
					</TouchableOpacity>

					{/* Interactions Analytics Option */}
					<TouchableOpacity
						onPress={navigateToInteractionsAnalytics}
						style={styles.menuItem}
						testID="interaction-analytics"
					>
						<Text style={styles.menuText}>
							<Ionicons name="people" size={20} color="black" />
							{"  "}
							Interactions Analytics
						</Text>
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	menuContainer: {
		position: "absolute", // Use absolute positioning
		top: 50, // Adjust the value to control vertical positioning
		right: 10, // Adjust the value to control horizontal positioning
		width: 200,
		backgroundColor: "white",
		borderRadius: 10,
		padding: 10,
		elevation: 5,
	},
	menuItem: {
		padding: 10,
	},
	menuText: {
		fontSize: 16,
		color: "#000",
	},
});

export default AnalyticsMenu;
