import React, { useState } from "react";
import {
	View,
	TouchableOpacity,
	Text,
	Platform,
	StyleSheet,
} from "react-native";
import DateTimePicker, {
	DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { colors } from "../../styles/colors";

interface DateTimePickerComponentProps {
	startDate: Date | undefined;
	setStartDate: (date: Date | undefined) => void;
	endDate: Date | undefined;
	setEndDate: (date: Date | undefined) => void;
}

const DateTimePickerComponent: React.FC<DateTimePickerComponentProps> = ({
	startDate,
	setStartDate,
	endDate,
	setEndDate,
}) => {
	const [showStartDatePicker, setShowStartDatePicker] = useState(false);
	const [showEndDatePicker, setShowEndDatePicker] = useState(false);

	const handleStartDateChange = (
		event: DateTimePickerEvent,
		selectedDate?: Date | undefined,
	) => {
		if (event.type === "set") {
			const currentDate = selectedDate ?? startDate;
			setShowStartDatePicker(false);
			setStartDate(currentDate);
		} else {
			setShowStartDatePicker(false); // Close if user cancels
		}
	};

	const handleEndDateChange = (
		event: DateTimePickerEvent,
		selectedDate?: Date | undefined,
	) => {
		if (event.type === "set") {
			const currentDate = selectedDate ?? endDate;
			setShowEndDatePicker(false);
			setEndDate(currentDate);
		} else {
			setShowEndDatePicker(false); // Close if user cancels
		}
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={() => setShowStartDatePicker(true)}
				style={styles.dateTimePicker}
			>
				<Text
					style={[
						styles.dateText,
						{ color: startDate ? colors.primary : "black" },
					]}
				>
					{startDate
						? moment(startDate).format("MM/DD/YYYY HH:mm")
						: "Select Start Date"}
				</Text>
			</TouchableOpacity>

			{showStartDatePicker && Platform.OS !== "web" && (
				<DateTimePicker
					value={startDate || new Date()}
					mode="datetime"
					display="default"
					onChange={handleStartDateChange}
				/>
			)}

			{showStartDatePicker && Platform.OS === "web" && (
				<DatePicker
					selected={startDate}
					onChange={(date) => setStartDate(date ?? undefined)}
					showTimeSelect
					dateFormat="dd MMMM yyyy - HH:mm"
				/>
			)}

			<View style={styles.spacing} />

			<TouchableOpacity
				onPress={() => setShowEndDatePicker(true)}
				style={styles.dateTimePicker}
			>
				<Text
					style={[
						styles.dateText,
						{ color: endDate ? colors.primary : "black" },
					]}
				>
					{endDate
						? moment(endDate).format("MM/DD/YYYY HH:mm")
						: "Select End Date"}
				</Text>
			</TouchableOpacity>

			{showEndDatePicker && Platform.OS !== "web" && (
				<DateTimePicker
					value={endDate || new Date()}
					mode="datetime"
					display="default"
					onChange={handleEndDateChange}
				/>
			)}

			{showEndDatePicker && Platform.OS === "web" && (
				<DatePicker
					selected={endDate}
					onChange={(date) => setEndDate(date ?? undefined)}
					showTimeSelect
					dateFormat="dd MMMM yyyy - HH:mm"
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		padding: 20,
	},
	dateTimePicker: {
		marginBottom: 20,
		width: "100%",
		backgroundColor: "white", // Set background to white
		padding: 10,
		borderWidth: 1,
		borderColor: "#ccc", // Border color
		borderRadius: 5,
		shadowColor: "#000", // Shadow color
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25, // Shadow opacity
		shadowRadius: 3.5, // Shadow radius
		elevation: 5, // Elevation for Android
	},
	dateText: {
		fontSize: 16,
		textAlign: "center",
	},
	spacing: {
		marginBottom: 30, // Add some space (adjust the value to fit your design)
	},
});

export default DateTimePickerComponent;
