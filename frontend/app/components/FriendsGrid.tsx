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
	username: string;
}

const FriendsGrid: React.FC<FriendsGridProps> = ({ friends, username }) => {
	const router = useRouter();
	const maxVisible = 8; // Max visible items

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
			style={styles.friendContainer}
			onPress={() =>
				router.navigate({
					pathname: "/screens/profile/ProfilePage",
					params: { friend: JSON.stringify(item), user: username },
				})
			}
		>
			<Image
				testID="profile-image"
				source={
					item.profile_picture_url
						? { uri: item.profile_picture_url }
						: require("../../assets/profile-icon.png")
				}
				style={[styles.profileImage, { borderColor: colors.primary }]}
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
			{friends.length === 0 ? (
				<TouchableOpacity
					style={styles.centeredButton}
					onPress={navigateToSearch}
				>
					<View style={styles.moreButton}>
						<Text style={styles.moreButtonText}>+</Text>
					</View>
				</TouchableOpacity>
			) : (
				<FlatList
					horizontal
					data={friends.slice(0, maxVisible)}
					renderItem={renderItem}
					keyExtractor={(item, index) => `friend-${item.friend_id}-${index}`}
					ListFooterComponent={() => (
						<TouchableOpacity
							style={styles.friendContainer}
							onPress={navigateToAllFriends}
						>
							<View style={styles.moreButton}>
								<Text style={styles.moreButtonText}>+</Text>
							</View>
						</TouchableOpacity>
					)}
					showsHorizontalScrollIndicator={false}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
	},
	friendContainer: {
		alignItems: "center",
		padding: 6,
		paddingHorizontal: 8,
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
		width: 53,
		height: 53,
		borderRadius: 26,
		backgroundColor: colors.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	moreButtonText: {
		fontSize: 38,
		color: "white",
		fontWeight: "bold",
		paddingBottom: 8,
	},
	centeredButton: {
		alignItems: "center",
		justifyContent: "center",
		flex: 1,
	},
});

export default FriendsGrid;
