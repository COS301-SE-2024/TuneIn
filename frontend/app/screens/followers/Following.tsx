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

const Following: React.FC = () => {
	const [search, setSearch] = useState("");
	const [following, setFollowing] = useState<Friend[]>([]);
	const [filteredFollowing, setFilteredFollowing] = useState<Friend[]>([]);
	const [fetchFollowingError, setFetchFollowingError] =
		useState<boolean>(false);

	const user = useLocalSearchParams();
	useEffect(() => {
		const fetchFollowing = async () => {
			try {
				const token = await auth.getToken(); // Await the token to resolve the promise
				const response = await axios.get(`${API_BASE_URL}/users/following`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				const mappedFollowing: Friend[] = response.data.map(
					(user: any): Friend => ({
						profile_picture_url: user.profile_picture_url,
						username: user.username,
						friend_id: user.userID,
						relationship: user.relationship,
					}),
				);
				setFollowing(mappedFollowing);
				setFilteredFollowing(mappedFollowing);
				setFetchFollowingError(false);
			} catch (error) {
				console.log("Error fetching following:", error);
				setFollowing([]);
				setFilteredFollowing([]);
				setFetchFollowingError(true);
			}
		};
		fetchFollowing();
	}, []);

	useEffect(() => {
		if (search === "") {
			setFilteredFollowing(following);
		} else {
			setFilteredFollowing(
				following.filter((user) =>
					user.username.toLowerCase().includes(search.toLowerCase()),
				),
			);
		}
	}, [search, following]);

	const handleUnfollow = async (friend: Friend) => {
		const token = await auth.getToken();
		if (token) {
			try {
				const response = await fetch(
					`${API_BASE_URL}/users/${friend.username}/unfollow`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
							"Content-Type": "application/json",
						},
					},
				);
				if (!response.ok) {
					console.error("Error unfollowing user:", response);
					return;
				}
				const updatedFollowing = following.filter(
					(user) => user.username !== friend.username,
				);
				setFollowing(updatedFollowing);
				setFilteredFollowing(updatedFollowing);
			} catch (error) {
				console.log("Error unfollowing user:", error);
				ToastAndroid.show("Failed to unfollow user", ToastAndroid.SHORT);
			}
		}
	};
	const renderFollowing = ({ item }: { item: Friend }) => (
		<FriendCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			user={user.username} // Replace with actual current user info
			cardType={
				item.relationship === "mutual" || item.relationship === "following"
					? "following"
					: "friend-follow"
			}
			handle={handleUnfollow}
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
			{filteredFollowing.length > 0 ? (
				<FlatList
					data={filteredFollowing}
					renderItem={renderFollowing}
					keyExtractor={(item) => item.username}
				/>
			) : (
				<Text style={styles.noFollowingText}>
					{fetchFollowingError
						? "Failed to load users followed"
						: "No users found."}
				</Text>
			)}
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
		borderRadius: 4,
		paddingHorizontal: 8,
		marginBottom: 16,
	},
	noFollowingText: {
		fontSize: 16,
		color: "#888",
	},
});

export default Following;
