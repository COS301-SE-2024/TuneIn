import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	FlatList,
} from "react-native";
import { useNavigation, useLocalSearchParams } from "expo-router";
import FriendCard from "../components/FriendCard";
import auth from "./../services/AuthManagement";
import axios from "axios";
import * as utils from "./../services/Utils";

interface Friend {
	profile_picture_url: string;
	username: string;
}

const AllFriends: React.FC = () => {
	const params = useLocalSearchParams();
	const myUsername = params.username;
	const navigation = useNavigation();
	const [friends, setFriends] = useState<Friend[]>([]); // State to hold friends list

	useEffect(() => {
		const fetchFriends = async () => {
			const token = await auth.getToken(); // Await the token to resolve the promise
			if (token) {
				const friendsData = await getFriends(token);
				setFriends(friendsData);
			}
		};

		fetchFriends();
	}, []);

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

	const goBack = () => {
		navigation.goBack();
	};

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
			<Text style={styles.title}>Your Friends</Text>
			{friends.length > 0 ? (
				<FlatList
					data={friends}
					renderItem={renderFriend}
					keyExtractor={(item) => item.username} // Assuming username is unique
					contentContainerStyle={styles.friendsList}
				/>
			) : (
				<Text style={styles.noFriendsText}>You have no friends added yet.</Text>
			)}
			<TouchableOpacity onPress={goBack} style={styles.goBackButton}>
				<Text style={styles.goBackText}>Go Back</Text>
			</TouchableOpacity>
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
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#4A4A4A",
		marginBottom: 16,
		textAlign: "center",
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
	goBackButton: {
		marginTop: 20,
		alignSelf: "center",
	},
	goBackText: {
		fontSize: 16,
		color: "#1E90FF",
	},
});

export default AllFriends;
