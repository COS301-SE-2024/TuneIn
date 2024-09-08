import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { UserDto } from "../../models/UserDto";

export interface ProfileCardProps {
	otherUser: UserDto;
	isSelected: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ otherUser, isSelected }) => {
	return (
		<TouchableOpacity
			testID="chat-item-touchable"
			style={[styles.container, isSelected && styles.selectedContainer]}
		>
			<Image
				source={{ uri: otherUser.profile_picture_url }}
				testID="chat-item-avatar"
				style={styles.avatar}
			/>
			<View style={{ flex: 1 }}>
				<Text style={styles.name}>{otherUser.profile_name}</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		margin: 10,
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#D1D5DB",
		backgroundColor: "white", // Default background color
	},
	selectedContainer: {
		backgroundColor: "#D0E8FF", // Background color when selected
		borderColor: "#007BFF", // Border color when selected
		borderWidth: 2, // Border width when selected
	},
	avatar: {
		width: 48,
		height: 48,
		borderRadius: 24,
		marginRight: 16,
	},
	name: {
		fontSize: 16,
		fontWeight: "bold",
	},
	lastMessage: {
		fontSize: 14,
		color: "gray",
	},
});

export default ProfileCard;
