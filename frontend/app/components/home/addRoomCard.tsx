import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ViewStyle,
} from "react-native";
import { useRouter } from "expo-router";

interface AddRoomCardProps {
	style?: ViewStyle;
}

const AddRoomCard: React.FC<AddRoomCardProps> = ({ style }) => {
	const router = useRouter();

	const navigateToTarget = () => {
		router.navigate("screens/rooms/CreateRoom");
	};

	return (
		<TouchableOpacity
			onPress={navigateToTarget}
			testID="add-room-card-touchable"
		>
			<View style={[styles.container, style]} testID="add-room-card-container">
				<Text style={styles.plusSign}>+</Text>
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	container: {
		width: 320, // Set your desired width
		height: 210, // Set your desired height
		backgroundColor: "#D3D3D3", // Light grey background
		borderRadius: 15,
		justifyContent: "center",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		margin: 8,
	},
	plusSign: {
		fontSize: 48,
		color: "#000",
		fontWeight: "bold",
	},
});

export default AddRoomCard;
