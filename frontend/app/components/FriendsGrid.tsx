import React from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	FlatList,
	TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Friend } from "../models/friend"; // Assume you have a Friend model
import { colors } from "../styles/colors";

interface FriendsGridProps {
	friends: Friend[];
	followers: Friend[];
	username: string;
}

const FriendsGrid: React.FC<FriendsGridProps> = ({
	friends,
	followers,
	username,
}) => {
	const router = useRouter();
	const maxVisible = 8; // Max visible items

	// Combine friends and followers, with friends coming first
	const combinedList = [...friends, ...followers].slice(0, maxVisible);

	const navigateToAllFriends = () => {
		const safeUserData = username ?? { username: "defaultUser" };
		router.navigate({
			pathname: "/screens/followers/FollowerStack",
			params: { username: safeUserData },
		});
	};

	const navigateToSearch = () => {
		router.navigate("/screens/(tabs)/Search");
	};

	const renderItem = ({ item, index }: { item: Friend; index: number }) => (
		<TouchableOpacity
			style={[styles.friendContainer]}
			onPress={() =>
				router.navigate({
					pathname: "/screens/profile/ProfilePage",
					params: { friend: JSON.stringify(item), user: username },
				})
			}
		>
			<Image
				source={
					item.profile_picture_url
						? { uri: item.profile_picture_url }
						: require("../../assets/profile-icon.png")
				}
				style={[
					styles.profileImage,
					{ borderColor: friends.includes(item) ? "green" : colors.primary },
				]}
			/>

			<Text style={styles.friendName}>
				{item.username.length > 10
					? item.username.slice(0, 8) + "..."
					: item.username}
			</Text>
		</TouchableOpacity>
	);

	return (
		<View style={styles.container}>
			<FlatList
				horizontal
				data={combinedList}
				renderItem={renderItem}
				keyExtractor={(item, index) => `friend-${item.friend_id}-${index}`}
				ListFooterComponent={() => (
					<TouchableOpacity
						style={styles.friendContainer}
						onPress={
							combinedList.length > 0 ? navigateToAllFriends : navigateToSearch
						}
					>
						<View style={styles.moreButton}>
							<Text style={styles.moreButtonText}>+</Text>
						</View>
					</TouchableOpacity>
				)}
				showsHorizontalScrollIndicator={false}
				extraData={combinedList}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
	},
	friendContainer: {
		alignItems: "center",
		padding: 4,
		marginRight: 12,
		paddingHorizontal: 10,
	},
	profileImage: {
		width: 54, // Adjust as needed
		height: 54, // Adjust as needed
		borderRadius: 27, // To make it circular
		borderWidth: 4, // Add a border
	},
	friendName: {
		marginTop: 8,
		fontSize: 12,
		color: colors.primaryText,
		textAlign: "center",
	},
	moreButton: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	moreButtonText: {
		fontSize: 24,
		color: "white",
		fontWeight: "bold",
	},
});

export default FriendsGrid;
