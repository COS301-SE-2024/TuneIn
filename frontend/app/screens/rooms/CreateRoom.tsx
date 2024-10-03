import React, { useState } from "react";
import {
	View,
	Text,
	Switch,
	TouchableOpacity,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router"; // Import useRouter from 'expo-router'
import MyToggleWidget from "../../components/ToggleWidget"; // Adjust the import path as needed
import CreateButton from "../../components/CreateButton";
import DateTimePickerComponent from "./DatePicker";

const CreateRoomScreen: React.FC = () => {
	const router = useRouter();
	const [isSwitched, setIsSwitched] = useState(false);
	const [newRoom] = useState<{
		is_permanent: boolean;
		is_private: boolean;
		is_scheduled: boolean;
		start_date: Date | undefined;
		end_date: Date | undefined;
	}>({
		is_permanent: true,
		is_private: false,
		is_scheduled: false,
		start_date: undefined,
		end_date: undefined,
	});
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);

	const handleToggleChange = (isFirstOptionSelected: boolean) => {
		newRoom["is_permanent"] = isFirstOptionSelected;
		console.log(
			isFirstOptionSelected ? "Permanent selected" : "Temporary selected",
			newRoom,
		);
	};

	const handleToggleChange2 = (isFirstOptionSelected: boolean) => {
		newRoom["is_private"] = !isFirstOptionSelected;
		console.log(
			isFirstOptionSelected ? "Public selected" : "Private selected",
			newRoom,
		);
	};

	const navigateToRoomDetails = () => {
		console.log("Navigating to RoomDetails screen");
		if (isSwitched) {
			newRoom["start_date"] = startDate;
			newRoom["end_date"] = endDate;
			if (startDate === undefined && endDate === undefined) {
				// alert message based on the OS
				if (Platform.OS === "web") {
					alert("Please select a start or end date");
				} else {
					ToastAndroid.show(
						"Please select a start or end date",
						ToastAndroid.SHORT,
					);
				}
				return;
			}
			// check if the dates make sense
			if (startDate && endDate && startDate >= endDate) {
				// alert message based on the OS
				if (Platform.OS === "web") {
					alert("Start date must be before end date");
				} else {
					ToastAndroid.show(
						"Start date must be before end date",
						ToastAndroid.SHORT,
					);
				}
				return;
			}
			// check if the start date is in the past
			if (startDate && startDate < new Date()) {
				if (Platform.OS === "web") {
					alert("Start date must be in the future");
				} else {
					ToastAndroid.show(
						"Start date must be in the future",
						ToastAndroid.SHORT,
					);
				}
				return;
			}
			// check if the end date is in the past
			if (endDate && endDate < new Date()) {
				alert("End date must be in the future");
				return;
			}
		}
		console.log("Today date:", new Date());
		newRoom["is_scheduled"] = isSwitched;
		const room = JSON.stringify(newRoom);
		console.log("New room:", room);
		router.navigate({
			pathname: "/screens/rooms/RoomDetails",
			params: { room: room },
		});
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
							<View styles={styles.dateTimePickerContainer}>
								<DateTimePickerComponent
									startDate={startDate}
									setStartDate={setStartDate}
									endDate={endDate}
									setEndDate={setEndDate}
								/>
								{/* button to clear dates*/}
								<TouchableOpacity
									onPress={() => {
										setStartDate(undefined);
										setEndDate(undefined);
									}}
								>
									<Text style={styles.clearDatesButton}>Clear dates</Text>
								</TouchableOpacity>
							</View>
						)}
					</View>
					<CreateButton title="Let's go" onPress={navigateToRoomDetails} />
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = {
	// add styles for the clear dates button with padding and size and spacing
	// turn it into a button
	// make the button such that the date picker will hover over it
	clearDatesButton: {
		padding: 10,
		fontSize: 16,
		textAlign: "center",
		flex: 1,
	},
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
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
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
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	scheduleText: {
		fontSize: 16,
		fontWeight: "bold",
	},
	dateTimePickerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
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
};

export default CreateRoomScreen;
