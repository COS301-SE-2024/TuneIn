import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

// Define types for the props
type MockDatePickerProps = {
	selected: Date | null;
	onChange: (date: Date | null) => void;
	dateFormat: string;
	placeholderText: string;
};

// Mock DatePicker component
const MockDatePicker: React.FC<MockDatePickerProps> = ({
	selected,
	onChange,
	dateFormat,
	placeholderText,
}) => {
	return (
		<View>
			<Text>{placeholderText}</Text>
			<TouchableOpacity onPress={() => onChange(new Date())}>
				<Text>Select Date</Text>
			</TouchableOpacity>
		</View>
	);
};

export default MockDatePicker; // Ensure default export
