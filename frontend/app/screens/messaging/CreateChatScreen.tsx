import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	FlatList,
	TextInput,
	StyleSheet,
	TouchableOpacity,
	Image,
} from "react-native";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { UserDto } from "../../models/UserDto";
// import auth from "../../services/AuthManagement";
// import * as utils from "../../services/Utils";
// import axios from "axios";
// import { set } from "react-datepicker/dist/date_utils";

interface CreateChatScreenProps {
	closeModal: () => void;
	friends: UserDto[];
}

/*
const users = [
	{
		id: "1",
		name: "John Doe",
		username: "@johndoe",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "2",
		name: "Jane Smith",
		username: "@janesmith",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "3",
		name: "Alice Johnson",
		username: "@alicejohnson",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "4",
		name: "Bob Brown",
		username: "@bobbrown",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "5",
		name: "Charlie Davis",
		username: "@charliedavis",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "6",
		name: "David Evans",
		username: "@davidevans",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "7",
		name: "Eve Foster",
		username: "@evefoster",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "8",
		name: "Frank Green",
		username: "@frankgreen",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "9",
		name: "Grace Hill",
		username: "@gracehill",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "10",
		name: "Henry King",
		username: "@henryking",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "11",
		name: "Ivy Lewis",
		username: "@ivylewis",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "12",
		name: "Jack Martin",
		username: "@jackmartin",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "13",
		name: "Kathy Nelson",
		username: "@kathynelson",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "14",
		name: "Liam Owens",
		username: "@liamowens",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "15",
		name: "Mia Parker",
		username: "@miaparker",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "16",
		name: "Noah Quinn",
		username: "@noahquinn",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "17",
		name: "Olivia Roberts",
		username: "@oliviaroberts",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "18",
		name: "Paul Scott",
		username: "@paulscott",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "19",
		name: "Quinn Taylor",
		username: "@quinntaylor",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "20",
		name: "Rachel Upton",
		username: "@rachelupton",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "21",
		name: "Steve Walker",
		username: "@stevewalker",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "22",
		name: "Tom Xavier",
		username: "@tomxavier",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "23",
		name: "Uma Young",
		username: "@umayoung",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
	{
		id: "24",
		name: "Victor Zane",
		username: "@victorzane",
		avatar:
			"https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	},
];
*/

const CreateChatScreen: React.FC<CreateChatScreenProps> = ({
	closeModal,
	friends,
}) => {
	const [searchQuery, setSearchQuery] = useState<string>("");
	const [users] = useState<UserDto[]>(friends);
	const [filteredUsers, setFilteredUsers] = useState<UserDto[]>([]);
	const router = useRouter();

	const handleSearch = (query: string) => {
		/*
		setSearchQuery(query);
		const filtered = users.filter((user) =>
			user.name.toLowerCase().includes(query.toLowerCase()),
		);
		setFilteredUsers(filtered);
		*/
		setSearchQuery(query);
		const filtered = users.filter((user) =>
			user.username.toLowerCase().includes(query.toLowerCase()),
		);
		setFilteredUsers(filtered);
	};

	useEffect(() => {
		console.log("Friends: ", friends);
		/*
		const sortedUsers = [...users].sort((a, b) => a.name.localeCompare(b.name));
		setFilteredUsers(sortedUsers);
		*/
	}, []);

	const handleUserSelect = (user: UserDto) => {
		router.push(`/screens/messaging/ChatScreen?username=${user.username}`);
	};

	return (
		<View style={styles.screenContainer}>
			<View style={styles.headerContainer}>
				<Text style={styles.headerText}>New Chat</Text>
				<TouchableOpacity
					onPress={closeModal}
					style={styles.closeButton}
					testID="close-button"
				>
					<Text style={styles.closeButtonText}>
						<Octicons name="x" size={24} color="black" />
					</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.searchContainer}>
				<Ionicons name="search" size={24} color="black" />
				<TextInput
					style={styles.searchInput}
					placeholder="Search for a user..."
					value={searchQuery}
					onChangeText={handleSearch}
					selectionColor="#CCCCCC"
				/>
			</View>
			<FlatList
				data={filteredUsers}
				keyExtractor={(item) => item.userID}
				renderItem={({ item }) => (
					<TouchableOpacity
						style={styles.userItem}
						onPress={() => handleUserSelect(item)}
					>
						<Image
							source={{ uri: item.profile_picture_url }}
							style={styles.avatar}
						/>
						<View>
							<Text style={styles.name}>{item.profile_name}</Text>
							<Text style={styles.username}>{item.username}</Text>
						</View>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	screenContainer: {
		flex: 1,
		backgroundColor: "white",
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		justifyContent: "center",
	},
	headerText: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		flex: 1,
	},
	// closeButton: {
	// 	position: "absolute",
	// 	right: 0,
	// },
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderColor: "#CCCCCC",
		borderWidth: 1,
		borderRadius: 20,
		paddingHorizontal: 16,
		marginBottom: 20,
		marginTop: 10,
	},
	searchInput: {
		flex: 1,
		height: 40,
		paddingVertical: 0,
		marginLeft: 10,
		borderWidth: 0,
	},
	userItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#CCCCCC",
	},
	avatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		marginRight: 10,
	},
	name: {
		fontSize: 16,
		fontWeight: "bold",
	},
	username: {
		fontSize: 14,
		color: "gray",
	},
	closeButton: {
		position: "absolute",
		right: 0,
	},
	closeButtonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default CreateChatScreen;
