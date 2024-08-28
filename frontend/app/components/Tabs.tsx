// Tabs.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import RoomTab from "./RoomTab"; // Adjust the path as needed

// Import screen components
import ChatScreen from "../screens/rooms/ChatRoom";
import RoomScreen from "../screens/rooms/CreateRoom";
import QueueScreen from "../screens/rooms/Playlist";

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
			<RoomTab activeTab={activeTab} setActiveTab={setActiveTab} />
			<View style={styles.screenContent}>{renderScreen()}</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f0f0f0",
	},
	screenContent: {
		flex: 1,
	},
});

export default Tabs;
