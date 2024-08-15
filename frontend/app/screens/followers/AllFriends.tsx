import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import FriendCard from "../../components/FriendCard";
import auth from "../../services/AuthManagement";
import axios from "axios";
import * as utils from "../../services/Utils";

interface Friend {
	profile_picture_url: string;
	username: string;
}

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

	const getFriends = async (token: string) => {
		try {
			const response = await axios.get<Friend[]>(
				`${utils.API_BASE_URL}/users/friends`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching friends:", error);
			return [];
		}
	};

	const getFriendRequests = async (token: string) => {
		try {
			const response = await axios.get<Friend[]>(
				`${utils.API_BASE_URL}/users/friends/requests`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			return response.data;
		} catch (error) {
			console.error("Error fetching friend requests:", error);
			return [];
		}
	};

	const renderRequest = ({ item }: { item: Friend }) => (
		<FriendCard
			profile_picture_url={item.profile_picture_url}
			username={item.username}
			friend={item}
			user="current_user" // Replace with actual current user info
		/>
	);

	const renderFriend = ({ item }: { item: Friend }) => (
		<FriendCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			user={myUsername}
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
