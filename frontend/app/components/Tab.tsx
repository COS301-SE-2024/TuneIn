// Tabs.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import CustomTopNavBar from "../components/RoomTab"; // Import your custom top nav bar component

// Sample screen components
const ChatScreen: React.FC = () => (
	<View style={styles.screenContainer}>
		<Text>Chat Screen</Text>
	</View>
);

const RoomScreen: React.FC = () => (
	<View style={styles.screenContainer}>
		<Text>Room Screen</Text>
	</View>
);

const QueueScreen: React.FC = () => (
	<View style={styles.screenContainer}>
		<Text>Queue Screen</Text>
	</View>
);

const Tabs: React.FC = () => {
	const [activeTab, setActiveTab] = useState("Room"); // Default tab is 'Room'

	const renderScreen = () => {
		switch (activeTab) {
			case "Chat":
				return <ChatScreen />;
			case "Room":
				return <RoomScreen />;
			case "Queue":
				return <QueueScreen />;
			default:
				return <RoomScreen />;
		}
	};

	return (
		<View style={styles.container}>
			{/* Custom Top Navigation Bar */}
			<CustomTopNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

			{/* Render the current screen */}
			<View style={styles.screenContent}>{renderScreen()}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f0f0",
	},
	screenContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	screenContent: {
		flex: 1,
	},
});

export default Tabs;
