import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Entypo, Ionicons } from "@expo/vector-icons";

interface RoomTabProps {
	activeTab: string;
	setActiveTab: (tab: string) => void;
}

const RoomTab: React.FC<RoomTabProps> = ({ activeTab, setActiveTab }) => {
	const router = useRouter();

	const navigateToAdavancedSettings = () => {
		router.navigate("/screens/rooms/AdvancedSettings");
	};

	const handleTabChange = (tab: string) => {
		setActiveTab(tab);
		switch (tab) {
			case "Chat":
				router.push("/screens/rooms/ChatRoom");
				// router.push("/screens/messaging/ChatRoom");
				break;
			case "Room":
				router.push("/screens/rooms/RoomPage");
				break;
			case "Queue":
				router.push("/screens/rooms/Playlist");
				break;
			default:
				break;
		}
	};

	return (
		<View style={styles.topBarContainer}>
			{/* Back Button */}
			<TouchableOpacity
				onPress={() => router.back()}
				style={styles.backButton}
				testID="backButton"
			>
				<Ionicons name="chevron-back" size={24} color="black" />
			</TouchableOpacity>

			{/* Tabs */}
			<View style={styles.tabBarContainer}>
				{["Chat", "Room", "Queue"].map((tab) => (
					<TouchableOpacity
						key={tab}
						onPress={() => handleTabChange(tab)}
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

			{/* Menu Button */}
			<TouchableOpacity
				onPress={navigateToAdavancedSettings}
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

export default RoomTab;
