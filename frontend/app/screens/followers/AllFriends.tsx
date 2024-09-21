import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	TextInput,
	ToastAndroid,
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

	useEffect(() => {
		const fetchFriends = async () => {
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
			} catch (error) {
				console.error("Error fetching data:", error);
				setFriendError(true);
			}
		};

		fetchFriends();
	}, []);

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

	const handleSendRequest = async (friend: Friend): Promise<void> => {
		try {
			await FriendServices.handleSendRequest(friend);
			const updatedPotentialFriends = potentialFriends.filter(
				(item) => item.friend_id !== friend.friend_id,
			);
			setPotentialFriends(updatedPotentialFriends);
			friend.relationship = "pending";
			setPendingRequests((prev) => [...prev, friend]);
		} catch (error) {
			ToastAndroid.show("Failed to send friend request.", ToastAndroid.SHORT);
		}
	};

	const handleCancelRequest = async (friend: Friend): Promise<void> => {
		try {
			await FriendServices.handleCancelRequest(friend);
			const updatedRequests = pendingRequests.filter(
				(request) => request.friend_id !== friend.friend_id,
			);
			setPendingRequests(updatedRequests);
			friend.relationship = "mutual";
			setPotentialFriends((prev) => [...prev, friend]);
		} catch (error) {
			ToastAndroid.show("Failed to cancel friend request.", ToastAndroid.SHORT);
		}
	};

	const handleFriendRequest = async (
		friend: Friend,
		accept: boolean,
	): Promise<void> => {
		try {
			await FriendServices.handleFriendRequest(friend, accept);
			const updatedRequests = requests.filter(
				(request) => request.friend_id !== friend.friend_id,
			);
			setRequests(updatedRequests);
			if (accept) {
				friend.relationship = "friend";
				setFriends((prev) => [...prev, friend]);
			} else {
				friend.relationship = "mutual";
				setPotentialFriends((prev) => [...prev, friend]);
			}
		} catch (error) {
			ToastAndroid.show("Unable to handle friend request.", ToastAndroid.SHORT);
		}
	};

	const handleFriend = async (friend: Friend): Promise<void> => {
		try {
			await FriendServices.handleFriend(friend);
			const updatedFriends = friends.filter(
				(item) => item.friend_id !== friend.friend_id,
			);
			setFriends(updatedFriends);
			friend.relationship = "mutual";
			setPotentialFriends((prev) => [...prev, friend]);
		} catch (error) {
			ToastAndroid.show("Failed to unfriend.", ToastAndroid.SHORT);
		}
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
		borderRadius: 4,
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
