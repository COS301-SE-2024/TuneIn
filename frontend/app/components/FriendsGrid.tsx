import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Friend } from "../models/friend"; // Assume you have a Friend model

interface FriendsGridProps {
	friends: Friend[];
	user: string;
	maxVisible: number;
}

const FriendsGrid: React.FC<FriendsGridProps> = ({
	friends,
	user,
	maxVisible,
}) => {
	console.log("Friend: " + JSON.stringify(friends) + "user: " + user);
	return (
		<View style={styles.container} testID="friends-grid-container">
			<View style={styles.gridContainer} testID="friends-grid">
				{friends.slice(0, maxVisible).map((friend, index) => (
					<Link
						key={index}
						href={`/screens/profile/ProfilePage?friend=${JSON.stringify(friend)}&user=${user}`}
						style={styles.link}
						testID={`friend-link-${friend.username}`}
					>
						<View
							style={styles.friendContainer}
							testID={`friend-container-${friend.username}`}
						>
							<View
								style={styles.imageBorder}
								testID={`friend-image-border-${friend.username}`}
							>
								<Image
									source={{ uri: friend.profile_picture_url }}
									style={styles.profileImage}
									testID={`friend-profile-image-${friend.username}`}
								/>
							</View>
							<Text
								style={styles.friendName}
								testID={`friend-name-${friend.username}`}
							>
								{friend.username}
							</Text>
						</View>
					</Link>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	gridContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: 16,
		paddingLeft: 32,
	},
	link: {
		width: "33.33%", // Use percentage for flexible layout
		padding: 8,
	},
	friendContainer: {
		alignItems: "center",
		padding: 4,
	},
	imageBorder: {
		alignItems: "center",
		borderWidth: 2,
		borderColor: "#0000FF", // Use hex color for blue
		borderRadius: 50,
		padding: 4,
	},
	profileImage: {
		width: 48,
		height: 48,
		borderRadius: 24,
	},
	friendName: {
		marginTop: 8,
		textAlign: "center",
	},
});

export default FriendsGrid;
