import React, { useState } from "react";
import {
	View,
	TouchableOpacity,
	TextInput,
	Platform,
	StyleSheet,
} from "react-native";
import DateTimePicker, {
	DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";

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
		const currentDate = selectedDate || startDate;
		setShowStartDatePicker(Platform.OS === "ios");
		setStartDate(currentDate);
	};

	const handleEndDateChange = (
		event: DateTimePickerEvent,
		selectedDate?: Date | undefined,
	) => {
		const currentDate = selectedDate || endDate;
		setShowEndDatePicker(Platform.OS === "ios");
		setEndDate(currentDate);
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				onPress={() => setShowStartDatePicker(true)}
				style={styles.dateTimePicker}
			>
				<TextInput
					style={styles.dateTimePickerInput}
					placeholder="Select Start Date and Time"
					value={startDate ? moment(startDate).format("MM/DD/YYYY HH:mm") : ""}
					editable={false}
				/>
			</TouchableOpacity>
			{showStartDatePicker && Platform.OS === "android" && (
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

			<TouchableOpacity
				onPress={() => setShowEndDatePicker(true)}
				style={styles.dateTimePicker}
			>
				<TextInput
					style={styles.dateTimePickerInput}
					placeholder="Select End Date and Time"
					value={endDate ? moment(endDate).format("MM/DD/YYYY HH:mm") : ""}
					editable={false}
				/>
			</TouchableOpacity>
			{showEndDatePicker && Platform.OS === "android" && (
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
					dateFormat="MM/dd/yyyy h:mm aa"
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
	},
	dateTimePickerInput: {
		fontSize: 16,
		padding: 10,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		width: "100%",
	},
	datePickerWrapper: {
		position: "absolute",
		zIndex: 1000,
		elevation: 1000, // For Android
	},
});

export default DateTimePickerComponent;
