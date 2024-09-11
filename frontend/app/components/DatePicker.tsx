import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../styles/colors";
// import Fuse from "fuse.js";
// import Selector from "./Selector";

interface DatePickerProps {
	selectedOption: string | null;
	onPress: () => void;
}

const DatePicker: React.FC<DatePickerProps> = ({ selectedOption, onPress }) => {
	const [date, setDate] = useState(selectedOption);

	useEffect(() => {
		setDate(selectedOption);
	}, [selectedOption]);

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[
					styles.filterDropDown,
					selectedOption ? styles.activeFilter : {},
				]}
				onPress={onPress}
			>
				<Text style={styles.filterText}>
					{date ? date.toLocaleString() : "Start Date"}
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 10,
		alignItems: "center",
	},
	filterDropDown: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 7,
		borderWidth: 1,
		borderColor: "#ccc",
		alignItems: "center",
		width: 120, // Adjust width to fit inline layout
	},
	activeFilter: {
		backgroundColor: colors.primary, // Example primary color
		borderColor: colors.primary, // Example primary color
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 5.84,
		elevation: 5,
	},
	filterText: {
		color: "#333",
		fontWeight: "bold",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalContent: {
		width: "80%",
		maxHeight: "80%", // Ensure modal content doesn't exceed the screen height
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
		alignItems: "center",
	},
	searchInput: {
		width: "100%",
		padding: 10,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "#ccc",
		marginBottom: 10,
	},
	scrollView: {
		width: "100%",
		marginBottom: 10,
	},
	filterOption: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
		width: "100%",
		alignItems: "center",
	},
	closeButton: {
		marginTop: 20,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: colors.primary,
		borderRadius: 5,
	},
});

export default DatePicker;
