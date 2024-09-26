import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";

const menuItems = [
	{
		title: "Getting Started",
		icon: "🚀",
		subcategories: [
			{ title: "Introduction", screen: "screens/help/GettingStarted" },
			{ title: "About", screen: "screens/help/GettingStarted" },
			{ title: "Creating an Account", screen: "screens/help/GettingStarted" },
			{ title: "Logging In", screen: "screens/help/GettingStarted" },
		],
		route: "screens/help/GettingStarted",
	},
	{
		title: "Profile Management",
		icon: "👤",
		subcategories: [
			{
				title: "Creating and Updating Your Profile",
				screen: "screens/help/ProfileManagement",
			},
			{ title: "Music Preferences", screen: "screens/help/ProfileManagement" },
			{
				title: "Personalized Recommendations",
				screen: "screens/help/ProfileManagement",
			},
			{ title: "Analytics", screen: "screens/help/ProfileManagement" },
		],
		route: "screens/help/ProfileManagement",
	},
	{
		title: "Interactive Sessions/Rooms",
		icon: "🎤",
		subcategories: [
			{ title: "Creating Rooms", screen: "screens/help/RoomInteraction" },
			{ title: "Room Settings", screen: "screens/help/RoomInteraction" },
			{ title: "Managing Rooms", screen: "screens/help/RoomInteraction" },
			{ title: "Joining Rooms", screen: "screens/help/RoomInteraction" },
			{ title: "Bookmarking Rooms", screen: "screens/help/RoomInteraction" },
		],
		route: "screens/help/RoomInteraction",
	},
	{
		title: "Room Collaboration",
		icon: "🤝",
		subcategories: [
			{ title: "Chat", screen: "screens/help/RoomCollaboration" },
			{ title: "Reactions", screen: "screens/help/RoomCollaboration" },
			{
				title: "Add To The Playlist",
				screen: "screens/help/RoomCollaboration",
			},
			{ title: "Voting", screen: "screens/help/RoomCollaboration" },
		],
		route: "screens/help/RoomCollaboration",
	},
	{
		title: "Friends and Following",
		icon: "👥",
		subcategories: [
			{ title: "Following", screen: "screens/help/FriendsFollowing" },
			{ title: "Friends", screen: "screens/help/FriendsFollowing" },
		],
		route: "screens/help/FriendsFollowing",
	},
	// ... (Add more sections here)
];

export default function HelpMenu() {
	const router = useRouter();

	const navigateToScreen = (screen) => {
		router.navigate(`/${screen}`);
	};

	return (
		<ScrollView contentContainerStyle={styles.container}>
			<Text style={styles.title} testID="title">
				Help Center
			</Text>
			{menuItems.map((item, index) => (
				<View key={index} style={styles.section} testID={`section-${index}`}>
					<TouchableOpacity
						style={styles.header}
						onPress={() => navigateToScreen(item.route)}
						testID={`menuItem-${index}`}
					>
						<Text style={styles.headerText}>
							{item.icon} {item.title}
						</Text>
					</TouchableOpacity>
					{item.subcategories.map((subcategory, subIndex) => (
						<TouchableOpacity
							key={subIndex}
							style={styles.subcategory}
							onPress={() => navigateToScreen(subcategory.screen)}
							// testID={`subcategory-${index}-${subIndex}`}
						>
							<Text style={styles.subcategoryText}>{subcategory.title}</Text>
						</TouchableOpacity>
					))}
				</View>
			))}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		padding: 20,
		paddingTop: 15,
		backgroundColor: colors.backgroundColor,
	},
	backButton: {
		position: "absolute",
		top: 30,
		left: 20,
		zIndex: 1,
	},
	title: {
		fontSize: 23,
		fontWeight: "bold",
		color: colors.primaryText,
		marginBottom: 20,
		textAlign: "center",
	},
	section: {
		backgroundColor: "#fff",
		padding: 15,
		borderRadius: 8,
		marginBottom: 15,
		shadowColor: "#000",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		elevation: 3,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	headerText: {
		fontSize: 18,
		fontWeight: "bold",
	},
	subcategory: {
		paddingVertical: 5,
	},
	subcategoryText: {
		fontSize: 16,
		color: colors.primary,
	},
});
