import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { User } from "../models/user";
import { colors } from "../styles/colors";

interface UserItemProps {
  user: User;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: user.profile_picture_url }} style={styles.profileImage} />
      <View style={styles.details}>
        <Text style={styles.profileName}>{user.profile_name}</Text>
        <Text style={styles.username}>{user.username}</Text>
        <TouchableOpacity
          style={[styles.followButton, isFollowing && styles.unfollowButton]}
          onPress={handleFollowToggle}
        >
          <Text style={styles.followButtonText}>{isFollowing ? "Unfollow" : "Follow"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  details: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  username: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: 500,
  },
  followButton: {
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    width: "30%",
    alignItems: "center",
  },
  unfollowButton: {
    backgroundColor: colors.secondary,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default UserItem;
