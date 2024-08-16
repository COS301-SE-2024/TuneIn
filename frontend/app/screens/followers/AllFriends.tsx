import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import FriendCard from "../../components/FriendCard";
import auth from "../../services/AuthManagement";
import axios from "axios";
import * as utils from "../../services/Utils";
import FriendRequestCard from "../../components/FriendRequestCard";
import { Friend } from "../../models/friend";

// interface Friend {
// 	profile_picture_url: string | null;
// 	username: string;
// 	friend_id: string;
// }

const AllFriends: React.FC = () => {
	const params = useLocalSearchParams();
	const myUsername = params.username;
	const [friends, setFriends] = useState<Friend[]>([]); // State to hold friends list
	const [search, setSearch] = useState(""); // State to hold search input value
	const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
	const [requests, setRequests] = useState<Friend[]>([]);
	const [filteredRequests, setFilteredRequests] = useState<Friend[]>([]);

	useEffect(() => {
		const fetchFriends = async () => {
			const token = await auth.getToken(); // Await the token to resolve the promise
			if (token) {
				const friendsData = await getFriends(token);
				const requestsData = await getFriendRequests(token);
				// map the response data to the Friend model correctly
				console.log("Friends:", friendsData);
				console.log("Requests:", requestsData);
				setFriends(friendsData);
				setRequests(requestsData);
			}
		};

		fetchFriends();
	}, []);

	useEffect(() => {
		if (search === "") {
			setFilteredRequests(requests);
			setFilteredFriends(friends);
		} else {
			setFilteredRequests(
				requests.filter((request) =>
					request.username.toLowerCase().includes(search.toLowerCase()),
				),
			);
			setFilteredFriends(
				friends.filter((friend) =>
					friend.username.toLowerCase().includes(search.toLowerCase()),
				),
			);
		}
	}, [search, requests, friends]);

	const getFriends = async (token: string): Promise<Friend[]> => {
		const _token = await auth.getToken();
		console.log("Token:", _token, "Token from auth:", token);
		try {
			const response = await axios.get(`${utils.API_BASE_URL}/users/friends`, {
				headers: { Authorization: `Bearer ${_token}` },
			});
			const mappedFriends: Friend[] = response.data.map((friend: any) => ({
				profile_picture_url: friend.profile_picture_url,
				friend_id: friend.userID,
				username: friend.username,
				relationship: friend.relationship,
			}));
			return mappedFriends;
		} catch (error) {
			console.error("Error fetching friends:", error);
			return [];
		}
	};

	const getFriendRequests = async (token: string): Promise<Friend[]> => {
		try {
			const response = await axios.get<Friend[]>(
				`${utils.API_BASE_URL}/users/friends/requests`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const mappedRequests: Friend[] = response.data.map((request: any) => ({
				profile_picture_url: request.profile_picture_url,
				friend_id: request.userID,
				username: request.username,
			}));
			return mappedRequests;
		} catch (error) {
			console.error("Error fetching friend requests:", error);
			return [];
		}
	};

	const handleFriendRequest = async (
		friend: Friend,
		accept: boolean,
	): Promise<void> => {
		const token = await auth.getToken();
		if (token) {
			try {
				const response = await fetch(
					`${utils.API_BASE_URL}/users/${friend.friend_id}/${accept ? "accept" : "reject"}`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				console.log("Response:", response.status);
				if (response.status === 201) {
					const updatedRequests = requests.filter(
						(request) => request.friend_id !== friend.friend_id,
					);
					setRequests(updatedRequests);
					// set friends if request is accepted
					if (accept) {
						setFriends([...friends, friend]);
					}
					console.log("Friend request handled successfully.", requests);
				}
			} catch (error) {
				console.error("Error handling request:", error);
			}
		}
	};

	const handleFriend = async (friend: Friend): Promise<void> => {
		const token = await auth.getToken();
		if (token) {
			try {
				const response = await fetch(
					`${utils.API_BASE_URL}/users/${friend.friend_id}/unfriend`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				console.log("Response:", response.status);
				if (response.status === 201) {
					const updatedFriends = friends.filter(
						(_friend) => _friend.friend_id !== friend.friend_id,
					);
					setFriends(updatedFriends);
					console.log("User unfriended successfully.", friends);
				}
			} catch (error) {
				console.error("Error following friend:", error);
			}
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

	const renderFriend = ({ item }: { item: Friend }) => (
		<FriendCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			user={myUsername}
			cardType="friend"
			handle={handleFriend}
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
			<View style={styles.friendsList}>
				<Text style={styles.followersTitle}>Friends</Text>
				{filteredFriends.length > 0 ? (
					<FlatList
						data={filteredFriends}
						renderItem={renderFriend}
						keyExtractor={(item) => item.username}
					/>
				) : (
					<Text style={styles.noFollowersText}>You have no friends.</Text>
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
					<Text style={styles.noRequestsText}>No friend requests found.</Text>
				)}
				{requests.length > 6 && (
					<View style={styles.moreRequests}>
						<Text style={styles.moreRequestsText}>
							View more friend requests
						</Text>
					</View>
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
