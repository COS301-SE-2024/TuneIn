import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Switch,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	Alert,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import MyToggleWidget from "../../components/ToggleWidget";
import DateTimePicker from "@react-native-community/datetimepicker";
import moment from "moment";
import CreateButton from "../../components/CreateButton";

const CreateRoomScreen: React.FC = () => {
	const router = useRouter();
	const [isSwitched, setIsSwitched] = useState(false);
	const [newRoom, setNewRoom] = useState({
		is_permanent: true,
		is_private: false,
		is_scheduled: false,
		start_date: new Date(), // Initialize with default date
	});
	const [date, setDate] = useState(new Date());
	const [time, setTime] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [showTimePicker, setShowTimePicker] = useState(false);

	const handleToggleChange = (isFirstOptionSelected: boolean) => {
		setNewRoom((prevRoom) => ({
			...prevRoom,
			is_permanent: isFirstOptionSelected,
		}));
		console.log(
			isFirstOptionSelected ? "Permanent selected" : "Temporary selected",
			newRoom,
		);
	};

	const handleToggleChange2 = (isFirstOptionSelected: boolean) => {
		setNewRoom((prevRoom) => ({
			...prevRoom,
			is_private: !isFirstOptionSelected,
		}));
		console.log(
			isFirstOptionSelected ? "Public selected" : "Private selected",
			newRoom,
		);
	};

	const navigateToRoomDetails = () => {
		const newDate = new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			time.getHours(),
			time.getMinutes(),
		);

		if (isSwitched) {
			if (newDate < new Date()) {
				Alert.alert(
					"Invalid Date",
					"Please select a future date and time.",
					[{ text: "OK" }],
					{ cancelable: false },
				);
				return;
			}

			Alert.alert(
				"Scheduled Room",
				`Room will be scheduled for ${moment(date).format(
					"MM/DD/YYYY",
				)} at ${moment(time).format("HH:mm")}.`,
				[{ text: "OK" }],
				{ cancelable: false },
			);

			setNewRoom((prevRoom) => ({
				...prevRoom,
				is_scheduled: true,
				start_date: newDate,
			}));
		} else {
			setNewRoom((prevRoom) => ({
				...prevRoom,
				is_scheduled: false,
				start_date: new Date(), // Set default date if not scheduled
			}));
		}

		const room = JSON.stringify(newRoom);
		router.push({
			pathname: "/screens/rooms/RoomDetails",
			params: { room: room },
		});
	};

	const handleDateChange = (event: any, selectedDate?: Date) => {
		const currentDate = selectedDate || date;
		setShowDatePicker(false);
		setDate(currentDate);
		console.log(
			"Selected date:",
			selectedDate,
			currentDate,
			moment(currentDate).format("MM/DD/YYYY"),
		);
	};

	const handleTimeChange = (event: any, selectedTime?: Date) => {
		const currentTime = selectedTime || time;
		setShowTimePicker(false);
		setTime(currentTime);
		console.log(
			"Selected time:",
			selectedTime,
			currentTime,
			moment(currentTime).format("HH:mm"),
		);
	};

	return (
		<KeyboardAvoidingView
			style={styles.keyboardAvoidingView}
			behavior={Platform.OS === "ios" ? "padding" : "height"}
		>
			<ScrollView contentContainerStyle={styles.scrollView}>
				<View style={styles.container}>
					<View style={styles.header}>
						<TouchableOpacity onPress={() => router.back()}>
							<Text style={styles.closeButton}>×</Text>
						</TouchableOpacity>
						<Text style={styles.headerTitle}>Room Option</Text>
						<View style={styles.headerSpacer} />
					</View>
					<View style={styles.optionsContainer}>
						<View style={styles.option}>
							<MyToggleWidget
								firstOption="Permanent"
								secondOption="Temporary"
								onChanged={handleToggleChange}
							/>
						</View>
						<View style={styles.option}>
							<MyToggleWidget
								firstOption="Public"
								secondOption="Private"
								onChanged={handleToggleChange2}
							/>
						</View>
						<View style={styles.scheduleContainer}>
							<Text style={styles.scheduleText}>Schedule for later</Text>
							<Switch value={isSwitched} onValueChange={setIsSwitched} />
						</View>
						{isSwitched && (
							<View style={styles.dateTimePickerContainer}>
								<TouchableOpacity
									onPress={() => setShowDatePicker(true)}
									style={styles.dateTimePicker}
								>
									<TextInput
										style={styles.dateTimePickerInput}
										placeholder="Select Day"
										value={moment(date).format("MM/DD/YYYY")}
										editable={false}
									/>
								</TouchableOpacity>
								{showDatePicker && (
									<DateTimePicker
										value={date}
										mode="date"
										display="default"
										onChange={handleDateChange}
									/>
								)}
								<TouchableOpacity onPress={() => setShowTimePicker(true)}>
									<TextInput
										style={styles.dateTimePickerInput}
										placeholder="Select Time"
										value={moment(time).format("HH:mm")}
										editable={false}
									/>
								</TouchableOpacity>
								{showTimePicker && (
									<DateTimePicker
										value={time}
										mode="time"
										display="default"
										onChange={handleTimeChange}
									/>
								)}
							</View>
						)}
					</View>
					<CreateButton title="Let's go" onPress={navigateToRoomDetails} />
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	keyboardAvoidingView: {
		flex: 1,
		backgroundColor: "white",
	},
	scrollView: {
		flexGrow: 1,
	},
	container: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	header: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		justifyContent: "space-between" as const,
		padding: 10,
	},
	closeButton: {
		fontSize: 20,
		fontWeight: "bold",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	headerSpacer: {
		width: 20,
	},
	optionsContainer: {
		paddingHorizontal: 10,
		paddingVertical: 20,
		flexGrow: 1,
	},
	option: {
		marginBottom: 20,
	},
	scheduleContainer: {
		flexDirection: "row" as const,
		alignItems: "center" as const,
		justifyContent: "space-between" as const,
		marginBottom: 20,
	},
	scheduleText: {
		fontSize: 16,
		fontWeight: "bold",
	},
	dateTimePickerContainer: {
		marginBottom: 20,
	},
	dateTimePicker: {
		marginBottom: 20,
	},
	dateTimePickerInput: {
		borderWidth: 1,
		borderColor: "#70c6d8",
		borderRadius: 10,
		padding: 10,
		backgroundColor: "#F9FAFB",
	},
});

export default CreateRoomScreen;
