import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { Friend } from "../models/friend"; // Assume you have a Friend model

interface FriendsGridProps {
	friends: Friend[];
	maxVisible: number;
}

const FriendsGrid: React.FC<FriendsGridProps> = ({ friends, maxVisible }) => {
  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
        {friends.slice(0, maxVisible).map((friend, index) => (
          <Link
            key={index}
            href={`/screens/profile/ProfilePage?friend=${JSON.stringify(friend)}`}
            style={styles.link}
          >
            <View style={styles.friendContainer}>
              <View style={styles.imageBorder}>
                <Image
                  source={{ uri: friend.profilePicture }}
                  style={styles.profileImage}
                />
              </View>
              <Text style={styles.friendName}>{friend.name}</Text>
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
