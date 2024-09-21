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
import FriendCard from "../../components/FriendCard";
import FriendRequestCard from "../../components/FriendRequestCard";
import { Friend } from "../../models/friend";
import { API_BASE_URL } from "../../services/Utils";
import auth from "../../services/AuthManagement";
import { useLocalSearchParams } from "expo-router";
import FriendServices from "../../services/FriendServices";

const Following: React.FC = () => {
	const [search, setSearch] = useState("");
	const [following, setFollowing] = useState<Friend[]>([]);
	const [filteredFollowing, setFilteredFollowing] = useState<Friend[]>([]);
	const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
	const [filteredPendingRequests, setFilteredPendingRequests] = useState<
		Friend[]
	>([]);
	const [fetchFollowingError, setFetchFollowingError] =
		useState<boolean>(false);
	const [fetchPendingError, setFetchPendingError] = useState<boolean>(false);
	const user = useLocalSearchParams();

	useEffect(() => {
		const loadFollowing = async () => {
			try {
				const mappedFollowing = await FriendServices.fetchFollowing();
				setFollowing(mappedFollowing);
				setFilteredFollowing(mappedFollowing);
				setFetchFollowingError(false);
			} catch {
				setFollowing([]);
				setFilteredFollowing([]);
				setFetchFollowingError(true);
			}
		};

		const loadPendingRequests = async () => {
			try {
				const mappedPendingRequests =
					await FriendServices.fetchPendingRequests();
				setPendingRequests(mappedPendingRequests);
				setFilteredPendingRequests(mappedPendingRequests);
				setFetchPendingError(false);
			} catch {
				setPendingRequests([]);
				setFilteredPendingRequests([]);
				setFetchPendingError(true);
			}
		};

		loadFollowing();
		loadPendingRequests();
	}, []);

	useEffect(() => {
		const filterData = () => {
			if (search === "") {
				setFilteredFollowing(following);
				setFilteredPendingRequests(pendingRequests);
			} else {
				const lowerCaseSearch = search.toLowerCase();
				setFilteredFollowing(
					following.filter((user) =>
						user.username.toLowerCase().includes(lowerCaseSearch),
					),
				);
				setFilteredPendingRequests(
					pendingRequests.filter((user) =>
						user.username.toLowerCase().includes(lowerCaseSearch),
					),
				);
			}
		};
		filterData();
	}, [search, following, pendingRequests]);

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
				if (!response.ok) throw new Error("Error unfollowing user.");
				const updatedFollowing = following.filter(
					(user) => user.username !== friend.username,
				);
				setFollowing(updatedFollowing);
				setFilteredFollowing(updatedFollowing);
			} catch {
				ToastAndroid.show("Failed to unfollow user", ToastAndroid.SHORT);
			}
		}
	};

	const handleFriend = async (friend: Friend) => {
		try {
			// This function could handle accepting a friend request
			await FriendServices.handleFriend(friend);
			const updatedPendingRequests = pendingRequests.filter(
				(item) => item.friend_id !== friend.friend_id,
			);
			setPendingRequests(updatedPendingRequests);
			setFilteredPendingRequests(updatedPendingRequests);
			friend.relationship = "mutual"; // Assuming you want to update the friend relationship
			setFollowing((prev) => [...prev, friend]); // Optionally add to following list
		} catch (error) {
			ToastAndroid.show("Failed to handle friend request.", ToastAndroid.SHORT);
		}
	};

	const renderFollowing = ({ item }: { item: Friend }) => (
		<FriendCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			user={user.username}
			cardType={
				item.relationship === "mutual" || item.relationship === "following"
					? "following"
					: "friend-follow"
			}
			handle={handleUnfollow}
		/>
	);

	const renderPendingRequest = ({ item }: { item: Friend }) => (
		<FriendRequestCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			handleRequest={() => handleFriend(item)} // Pass the handleFriend function
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

			{/* Following Section */}
			<Text style={styles.sectionTitle}>People You Follow</Text>
			{filteredFollowing.length > 0 ? (
				<FlatList
					data={filteredFollowing}
					renderItem={renderFollowing}
					keyExtractor={(item) => item.username}
				/>
			) : (
				<Text style={styles.noDataText}>
					{fetchFollowingError
						? "Failed to load following users"
						: "No users found."}
				</Text>
			)}

			{/* Pending Requests Section */}
			<Text style={styles.sectionTitle}>Pending Friend Requests</Text>
			{filteredPendingRequests.length > 0 ? (
				<FlatList
					data={filteredPendingRequests}
					renderItem={renderPendingRequest}
					keyExtractor={(item) => item.username}
				/>
			) : (
				<Text style={styles.noDataText}>
					{fetchPendingError
						? "Failed to load pending requests"
						: "No pending requests found."}
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
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	noDataText: {
		fontSize: 16,
		color: "#888",
	},
});

export default Following;
