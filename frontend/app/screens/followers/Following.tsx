import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	StyleSheet,
	ToastAndroid,
	Platform,
	Alert,
} from "react-native";
import FriendCard from "../../components/FriendCard";
import { Friend } from "../../models/friend";
import { useLocalSearchParams } from "expo-router";
import FriendServices from "../../services/FriendServices";
import { useFocusEffect } from "@react-navigation/native";

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
	const myUsername = user.username;

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
			const mappedPendingRequests = await FriendServices.fetchPendingRequests();
			setPendingRequests(mappedPendingRequests);
			setFilteredPendingRequests(mappedPendingRequests);
			setFetchPendingError(false);
		} catch {
			setPendingRequests([]);
			setFilteredPendingRequests([]);
			setFetchPendingError(true);
		}
	};

	// Initial load on component mount
	useEffect(() => {
		loadFollowing();
		loadPendingRequests();
	}, []);

	// Reload data when the page is focused
	useFocusEffect(
		React.useCallback(() => {
			loadFollowing();
			loadPendingRequests();
		}, []),
	);

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

	const showError = (message: string) => {
		if (Platform.OS === "android") {
			ToastAndroid.show(message, ToastAndroid.SHORT);
		} else {
			Alert.alert("Error", message);
		}
	};

	const unfollowUser = async (friend: Friend) => {
		try {
			await FriendServices.handleUnfollow(friend);
			const updatedFollowing = following.filter(
				(user) => user.username !== friend.username,
			);
			setFollowing(updatedFollowing);
			setFilteredFollowing(updatedFollowing);
		} catch {
			showError("Failed to unfollow user");
		}
	};

	const handleFriend = async (friend: Friend) => {
		try {
			await FriendServices.handleFriend(friend);
			const updatedPendingRequests = pendingRequests.filter(
				(item) => item.friend_id !== friend.friend_id,
			);
			setPendingRequests(updatedPendingRequests);
			setFilteredPendingRequests(updatedPendingRequests);
			friend.relationship = "mutual";
			setFollowing((prev) => [...prev, friend]);
		} catch (error) {
			showError("Failed to handle friend request.");
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
			handle={unfollowUser}
		/>
	);

	const handleCancelRequest = async (friend: Friend): Promise<void> => {
		try {
			await FriendServices.handleCancelRequest(friend);
			const updatedRequests = pendingRequests.filter(
				(request) => request.friend_id !== friend.friend_id,
			);
			setPendingRequests(updatedRequests);
			friend.relationship = "mutual";
		} catch (error) {
			ToastAndroid.show("Failed to cancel friend request.", ToastAndroid.SHORT);
		}
	};

	const renderPendingRequest = ({ item }: { item: Friend }) => {
		const getHandler = (item: Friend) => {
			const handlers: { [key: string]: (friend: Friend) => Promise<void> } = {
				friend: handleFriend,
				pending: handleCancelRequest,
			};

			return handlers[item.relationship as string] || (() => {});
		};

		return (
			<FriendCard
				profilePicture={item.profile_picture_url}
				username={item.username}
				friend={item}
				user={myUsername}
				cardType={item.relationship as "friend" | "pending" | "mutual"}
				handle={getHandler(item)}
			/>
		);
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.searchBar}
				placeholder="Search..."
				value={search}
				onChangeText={setSearch}
			/>

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
	sectionTitle: {
		paddingTop: 20,
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
