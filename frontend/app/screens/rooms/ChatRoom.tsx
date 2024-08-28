// ChatScreen.tsx
import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import RoomTab from "../../components/RoomTab";

const ChatScreen: React.FC = () => {
	const [activeTab, setActiveTab] = useState("Chat");

	return (
		<View style={styles.container}>
			{/* RoomTab component */}
			<RoomTab activeTab={activeTab} setActiveTab={setActiveTab} />

			{/* Content of the screen */}
			<View style={styles.screenContent}>
				<Text>Chat Screen</Text>
			</View>
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
		justifyContent: "center",
		alignItems: "center",
	},
});

export default ChatScreen;
