import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	StyleSheet,
	ToastAndroid,
} from "react-native";
import axios from "axios";
import FriendCard from "../../components/FriendCard"; // Import the FriendCard component
import { Friend } from "../../models/friend"; // Assume you have a Friend model
import { API_BASE_URL } from "../../services/Utils";
import auth from "../../services/AuthManagement";
import { useLocalSearchParams } from "expo-router";

const Followers: React.FC = () => {
	const [search, setSearch] = useState("");
	const [followers, setFollowers] = useState<Friend[]>([]);
	const [filteredFollowers, setFilteredFollowers] = useState<Friend[]>([]);
	const [friendError, setFriendError] = useState<boolean>(false);
	const user = useLocalSearchParams();

	useEffect(() => {
		const fetchFollowers = async () => {
			try {
				const token = await auth.getToken(); // Await the token to resolve the promise
				const followersResponse = await axios.get<Friend[]>(
					`${API_BASE_URL}/users/followers`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				// Filter to only show users who are following you
				const mappedFollowers = followersResponse.data
					.filter(
						(user: any) =>
							user.relationship === "follower" ||
							user.relationship === "mutual",
					)
					.map(
						(user: any): Friend => ({
							profile_picture_url: user.profile_picture_url,
							username: user.username,
							friend_id: user.userID,
							relationship: user.relationship,
						}),
					);
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

		fetchFollowers();
	}, []);

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

	const handleFollow = async (friend: Friend) => {
		const token = await auth.getToken();
		if (token) {
			try {
				const action = friend.relationship === "mutual" ? "unfollow" : "follow";
				const response = await fetch(
					`${API_BASE_URL}/users/${friend.username}/${action}`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				// change relationship status of the user
				if (response.ok) {
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
				} else {
					console.log("Error following user:", response);
					ToastAndroid.show(`Failed to ${action} user.`, ToastAndroid.SHORT);
				}
				throw false;
			} catch (error) {
				console.log("Error following user:", error);
				ToastAndroid.show(
					`Failed to ${friend.relationship === "mutual" ? "unfollow" : "follow"} user.`,
					ToastAndroid.SHORT,
				);
			}
		}
	};

	const renderFollower = ({ item }: { item: Friend }) => (
		<FriendCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			user={user.username} // Replace with actual current user info
			cardType={
				item.relationship === "mutual" || item.relationship === "following"
					? "following"
					: "follower"
			}
			handle={handleFollow}
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
