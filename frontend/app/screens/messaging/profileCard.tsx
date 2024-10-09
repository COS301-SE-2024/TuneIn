import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { UserDto } from "../../../api";
import { colors } from "../../styles/colors";

export interface ProfileCardProps {
	otherUser: UserDto;
	isSelected: boolean;
	select: () => void; // Add select function as a prop
}

const ProfileCard: React.FC<ProfileCardProps> = ({
	otherUser,
	isSelected,
	select,
}) => {
	return (
		<TouchableOpacity
			testID="chat-item-touchable"
			style={[styles.container]}
			onPress={select} // Call select function on press
		>
			<Image
				source={{ uri: otherUser.profile_picture_url }}
				testID="chat-item-avatar"
				style={[styles.avatar, isSelected && styles.selected]}
			/>
			<View style={{ flex: 1 }}>
				<Text style={[styles.name, isSelected && styles.selectedName]}>
					{otherUser.profile_name}
				</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#D1D5DB",
		backgroundColor: colors.backgroundColor, // Default background color
	},
	selected: {
		width: 54,
		height: 54,
		borderRadius: 27,
		marginRight: 16,
		borderColor: colors.primary,
		borderWidth: 4, // Border width when selected
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
	selectedName: {
		fontSize: 17,
		fontWeight: "bold",
		color: colors.primary,
	},
});

export default ProfileCard;
