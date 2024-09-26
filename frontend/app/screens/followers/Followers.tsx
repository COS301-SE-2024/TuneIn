import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	StyleSheet,
	ToastAndroid,
	Alert, // For iOS/web
	Platform,
} from "react-native";
import FriendCard from "../../components/FriendCard";
import { Friend } from "../../models/friend";
import FriendServices from "../../services/FriendServices";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const Followers: React.FC = () => {
	const [search, setSearch] = useState("");
	const [followers, setFollowers] = useState<Friend[]>([]);
	const [filteredFollowers, setFilteredFollowers] = useState<Friend[]>([]);
	const [friendError, setFriendError] = useState<boolean>(false);
	const user = useLocalSearchParams();

	const getFollowers = async () => {
		try {
			const mappedFollowers = await FriendServices.fetchFollowers();
			setFollowers(mappedFollowers);
			setFilteredFollowers(mappedFollowers);
			setFriendError(false);
		} catch (error) {
			console.log("Error fetching data:", error);
			setFollowers([]);
			setFilteredFollowers([]);
			setFriendError(true);
		}
	};

	// Initial fetch on component mount
	useEffect(() => {
		getFollowers();
	}, []);

	// Reload data immediately when the page is focused
	useFocusEffect(
		React.useCallback(() => {
			getFollowers();
		}, []),
	);

	useEffect(() => {
		if (search === "") {
			setFilteredFollowers(followers);
		} else {
			setFilteredFollowers(
				followers.filter((follower) =>
					follower.username.toLowerCase().includes(search.toLowerCase()),
				),
			);
		}
	}, [search, followers]);

	// Handle follow function
	const handleFollow = async (friend: Friend) => {
		try {
			await FriendServices.handleFollow(friend);
			const updatedFollowers = followers.map((follower) => {
				if (follower.username === friend.username) {
					return {
						...follower,
						relationship:
							friend.relationship === "mutual" ? "follower" : "mutual",
					};
				}
				return follower;
			});
			setFollowers(updatedFollowers);
			setFilteredFollowers(updatedFollowers);
		} catch (error) {
			const message = `Failed to ${friend.relationship === "mutual" ? "unfollow" : "follow"} user.`;
			// Use ToastAndroid for Android, otherwise use Alert
			if (Platform.OS === "android") {
				ToastAndroid.show(message, ToastAndroid.SHORT);
			} else {
				Alert.alert("Error", message);
			}
		}
	};

	// Handle unfollow function for mutual relationships
	const handleUnfollow = async (friend: Friend) => {
		try {
			await FriendServices.handleUnfollow(friend);
		} catch (error) {
			const message = "Failed to unfollow user.";
			if (Platform.OS === "android") {
				ToastAndroid.show(message, ToastAndroid.SHORT);
			} else {
				Alert.alert("Error", message);
			}
		}
	};

	const renderFollower = ({ item }: { item: Friend }) => (
		<FriendCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			user={user.username}
			cardType={
				item.relationship === "mutual" || item.relationship === "following"
					? "following"
					: "follower"
			}
			handle={item.relationship === "mutual" ? handleUnfollow : handleFollow} // Use handleUnfollow if mutual
		/>
	);

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.searchBar}
				placeholder="Search..."
				value={search}
				onChangeText={setSearch}
			/>
			<View style={styles.followersSection}>
				{filteredFollowers.length > 0 ? (
					<FlatList
						data={filteredFollowers}
						renderItem={renderFollower}
						keyExtractor={(item) => item.username}
					/>
				) : (
					<Text style={styles.noFollowersText}>
						{friendError
							? "Failed to load followers"
							: "No followers available."}
					</Text>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
		paddingTop: 16,
		backgroundColor: "#fff",
	},
	searchBar: {
		height: 40,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 8,
		marginBottom: 16,
	},
	followersSection: {
		flex: 1,
	},
	noFollowersText: {
		fontSize: 16,
		color: "#888",
	},
});

export default Followers;
