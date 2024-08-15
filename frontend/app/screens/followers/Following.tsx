import React, { useState, useEffect } from "react";
import { View, Text, TextInput, FlatList, StyleSheet } from "react-native";
import axios from "axios";
import FriendCard from "../../components/FriendCard"; // Import the FriendCard component
import { Friend } from "../../models/friend"; // Assume you have a Friend model
import { API_BASE_URL } from "../../services/Utils";
import auth from "../../services/AuthManagement";

const Following: React.FC = () => {
	const [search, setSearch] = useState("");
	const [following, setFollowing] = useState<Friend[]>([]);
	const [filteredFollowing, setFilteredFollowing] = useState<Friend[]>([]);

	useEffect(() => {
		const fetchFollowing = async () => {
			try {
				const token = await auth.getToken(); // Await the token to resolve the promise
				const response = await axios.get(`${API_BASE_URL}/users/following`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				console.log("Following:", response.data);
				setFollowing(response.data);
				setFilteredFollowing(response.data);
			} catch (error) {
				console.error("Error fetching following:", error);
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

	const renderFollowing = ({ item }: { item: Friend }) => (
		<FriendCard
			profilePicture={item.profile_picture_url}
			username={item.username}
			friend={item}
			user="current_user" // Replace with actual current user info
			cardType="following"
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
				<Text style={styles.noFollowingText}>No users found.</Text>
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
