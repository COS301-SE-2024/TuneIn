import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../styles/colors";

interface DeleteButtonProps {
	title: string;
	onPress: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ title, onPress }) => {
	return (
		<TouchableOpacity style={styles.button} onPress={onPress}>
			<Text style={styles.buttonText}>{title}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		height: 52,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFF",
		borderColor: "#E8ECF4",
		borderWidth: 1,
		borderRadius: 56,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: "bold",
		color: colors.primaryText,
	},
});

export default DeleteButton;
