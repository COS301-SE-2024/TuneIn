import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TextInput,
	ToastAndroid,
	Platform,
	Alert,
	RefreshControl,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import FriendCard from "../../components/FriendCard";
import FriendServices from "../../services/FriendServices";
import { Friend } from "../../models/friend";
import FriendRequestCard from "../../components/FriendRequestCard";

const AllFriends: React.FC = () => {
	const params = useLocalSearchParams();
	const myUsername = params.username;
	const [friends, setFriends] = useState<Friend[]>([]);
	const [search, setSearch] = useState("");
	const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
	const [requests, setRequests] = useState<Friend[]>([]);
	const [filteredRequests, setFilteredRequests] = useState<Friend[]>([]);
	const [potentialFriends, setPotentialFriends] = useState<Friend[]>([]);
	const [filteredPotentialRequests, setFilteredPotentialRequests] = useState<
		Friend[]
	>([]);
	const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
	const [filteredPendingRequests, setFilteredPendingRequests] = useState<
		Friend[]
	>([]);
	const [friendError, setFriendError] = useState(false);
	const [friendReqError, setFriendReqError] = useState(false);
	const [potentialFriendError, setPotentialFriendError] = useState(false);
	const [pendingError, setPendingError] = useState(false);
	const [refreshing, setRefreshing] = useState(false); // State for refreshing

	useEffect(() => {
		fetchFriends();
	}, []);

	const fetchFriends = async () => {
		setRefreshing(true); // Start refreshing
		try {
			const [
				friendsData,
				requestsData,
				potentialFriendsData,
				pendingRequestsData,
			] = await Promise.all([
				FriendServices.getFriends(),
				FriendServices.getFriendRequests(),
				FriendServices.getPotentialFriends(),
				FriendServices.getPendingRequests(),
			]);

			setFriends(friendsData);
			setRequests(requestsData);
			setPotentialFriends(potentialFriendsData);
			setPendingRequests(pendingRequestsData);
			setFriendError(false);
			setFriendReqError(false);
			setPotentialFriendError(false);
			setPendingError(false);
		} catch (error) {
			console.error("Error fetching data:", error);
			setFriendError(true);
		} finally {
			setRefreshing(false); // End refreshing
		}
	};

	useEffect(() => {
		if (search === "") {
			setFilteredRequests(requests);
			setFilteredFriends(friends);
			setFilteredPotentialRequests(potentialFriends);
			setFilteredPendingRequests(pendingRequests);
		} else {
			const lowerSearch = search.toLowerCase();
			setFilteredRequests(
				requests.filter((request) =>
					request.username.toLowerCase().includes(lowerSearch),
				),
			);
			setFilteredFriends(
				friends.filter((friend) =>
					friend.username.toLowerCase().includes(lowerSearch),
				),
			);
			setFilteredPotentialRequests(
				potentialFriends.filter((friend) =>
					friend.username.toLowerCase().includes(lowerSearch),
				),
			);
			setFilteredPendingRequests(
				pendingRequests.filter((request) =>
					request.username.toLowerCase().includes(lowerSearch),
				),
			);
		}
	}, [search, requests, friends, potentialFriends, pendingRequests]);

	const showError = (message: string) => {
		if (Platform.OS === "android") {
			ToastAndroid.show(message, ToastAndroid.SHORT);
		} else {
			Alert.alert("Error", message);
		}
	};

	const handleSendRequest = async (friend: Friend): Promise<void> => {
		// ... (rest of your existing code)
	};

	const handleCancelRequest = async (friend: Friend): Promise<void> => {
		// ... (rest of your existing code)
	};

	const handleFriendRequest = async (
		friend: Friend,
		accept: boolean,
	): Promise<void> => {
		// ... (rest of your existing code)
	};

	const handleFriend = async (friend: Friend): Promise<void> => {
		// ... (rest of your existing code)
	};

	const renderRequest = ({ item }: { item: Friend }) => (
		<FriendRequestCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			handleRequest={handleFriendRequest}
		/>
	);

	const renderFriend = ({ item }: { item: Friend }) => {
		const getHandler = (item: Friend) => {
			const handlers: { [key: string]: (friend: Friend) => Promise<void> } = {
				pending: handleCancelRequest,
				friend: handleFriend,
				mutual: handleSendRequest,
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
			<View style={styles.friendsList}>
				<Text style={styles.followersTitle}>Friends</Text>
				{filteredFriends.length > 0 ? (
					<FlatList
						data={filteredFriends}
						renderItem={renderFriend}
						keyExtractor={(item) => item.username}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={fetchFriends}
							/>
						}
					/>
				) : (
					<Text style={styles.noFollowersText}>
						{friendError ? "Failed to load friends." : "You have no friends."}
					</Text>
				)}
			</View>
			<View style={styles.requestsSection}>
				<Text style={styles.requestsTitle}>Friend Requests</Text>
				{filteredRequests.length > 0 ? (
					<FlatList
						data={filteredRequests}
						renderItem={renderRequest}
						keyExtractor={(item) => item.username}
						contentContainerStyle={styles.friendsList}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={fetchFriends}
							/>
						}
					/>
				) : (
					<Text style={styles.noRequestsText}>
						{friendReqError
							? "Failed to load friend requests."
							: "No friend requests found."}
					</Text>
				)}
			</View>
			<View style={styles.requestsSection}>
				<Text style={styles.requestsTitle}>Potential Friends</Text>
				{filteredPotentialRequests.length > 0 ? (
					<FlatList
						data={filteredPotentialRequests}
						renderItem={renderFriend}
						keyExtractor={(item) => item.username}
						contentContainerStyle={styles.friendsList}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={fetchFriends}
							/>
						}
					/>
				) : (
					<Text style={styles.noRequestsText}>
						{potentialFriendError
							? "Failed to load potential friends."
							: "No potential friends found."}
					</Text>
				)}
			</View>
			<View style={styles.requestsSection}>
				<Text style={styles.requestsTitle}>Pending Requests</Text>
				{filteredPendingRequests.length > 0 ? (
					<FlatList
						data={filteredPendingRequests}
						renderItem={renderFriend}
						keyExtractor={(item) => item.username}
						contentContainerStyle={styles.friendsList}
						refreshControl={
							<RefreshControl
								refreshing={refreshing}
								onRefresh={fetchFriends}
							/>
						}
					/>
				) : (
					<Text style={styles.noRequestsText}>
						{pendingError
							? "Failed to load pending requests."
							: "No pending requests found."}
					</Text>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 16,
		paddingHorizontal: 16,
		backgroundColor: "#fff",
	},
	friendsList: {
		paddingBottom: 16,
	},
	noFriendsText: {
		fontSize: 16,
		color: "#888",
		textAlign: "center",
		marginTop: 32,
	},
	searchBar: {
		height: 40,
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 8,
		marginBottom: 16,
	},
	requestsSection: {
		marginBottom: 16,
	},
	requestsTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
	},
	moreRequests: {
		paddingVertical: 8,
		alignItems: "center",
	},
	moreRequestsText: {
		fontSize: 16,
		color: "#007BFF",
	},
	noRequestsText: {
		fontSize: 16,
		color: "#888",
	},
	followersTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
	},
	noFollowersText: {
		fontSize: 16,
		color: "#888",
	},
});

export default AllFriends;
