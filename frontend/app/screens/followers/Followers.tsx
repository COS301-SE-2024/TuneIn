import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	FlatList,
	StyleSheet,
	TouchableOpacity,
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
	const user = useLocalSearchParams();
	useEffect(() => {
		const fetchRequestsAndFollowers = async () => {
			try {
				const token = await auth.getToken(); // Await the token to resolve the promise
				const followersResponse = await axios.get<Friend[]>(
					`${API_BASE_URL}/users/followers`,
					{
						headers: { Authorization: `Bearer ${token}` },
					},
				);
				const mappedFollowers = followersResponse.data.map((user: any) => ({
					profile_picture_url: user.profile_picture_url,
					username: user.username,
					friend_id: user.userID,
				}));
				setFollowers(mappedFollowers);
				setFilteredFollowers(mappedFollowers);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchRequestsAndFollowers();
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
				const response = await fetch(
					`${API_BASE_URL}/users/${friend.friend_id}/follow`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				console.log("Following user:", friend, response);
				// const updatedFollowers = followers.filter(
				// 	(user) => user.username !== friend.username,
				// );
				// setFollowers(updatedFollowers);
				// setFilteredFollowers(updatedFollowers);
			} catch (error) {
				console.error("Error following user:", error);
			}
		}
	};

	const renderFollower = ({ item }: { item: Friend }) => (
		<FriendCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			user={user.username} // Replace with actual current user info
			cardType="followers"
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
			{/* <View style={styles.requestsSection}>
				<Text style={styles.requestsTitle}>Requests</Text>
				{requestsToShow.length > 0 ? (
					<>
						<FlatList
							data={requestsToShow}
							renderItem={renderRequest}
							keyExtractor={(item) => item.username}
							ListFooterComponent={
								remainingRequests > 0 && (
									<TouchableOpacity style={styles.moreRequests}>
										<Text style={styles.moreRequestsText}>
											+{remainingRequests} more requests
										</Text>
									</TouchableOpacity>
								)
							}
						/>
					</>
				) : (
					<Text style={styles.noRequestsText}>No requests available.</Text>
				)}
			</View> */}
			<View style={styles.followersSection}>
				{/* <Text style={styles.followersTitle}>Followers</Text> */}
				{filteredFollowers.length > 0 ? (
					<FlatList
						data={filteredFollowers}
						renderItem={renderFollower}
						keyExtractor={(item) => item.username}
					/>
				) : (
					<Text style={styles.noFollowersText}>No followers available.</Text>
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
	followersSection: {
		flex: 1,
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

export default Followers;
