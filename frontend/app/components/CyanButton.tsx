import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors } from "../styles/colors";

interface CyanButtonProps {
	title: string;
	onPress: () => void;
}

const CyanButton: React.FC<CyanButtonProps> = ({ title, onPress }) => {
	return (
		<TouchableOpacity style={styles.button} onPress={onPress}>
			<Text style={styles.buttonText}>{title}</Text>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	button: {
		width: "92%",
		height: 52,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.primary,
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
		color: "#FFF",
	},
});

export default CyanButton;
