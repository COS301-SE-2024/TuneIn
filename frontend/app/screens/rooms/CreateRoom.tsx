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
import { useRouter } from "expo-router";
import MyToggleWidget from "../../components/ToggleWidget";
import CreateButton from "../../components/CreateButton";
import DateTimePickerComponent from "./DatePicker";
import { colors } from "../../styles/colors";

const CreateRoomScreen: React.FC = () => {
	const router = useRouter();
	const [isSwitched, setIsSwitched] = useState(false);
	const [newRoom] = useState<{
		is_permanent: boolean;
		is_private: boolean;
		is_scheduled: boolean;
		start_date: Date | null;
		end_date: Date | null;
	}>({
		is_permanent: true,
		is_private: false,
		is_scheduled: false,
		start_date: null,
		end_date: null,
	});
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);

	const handleToggleChange = (isFirstOptionSelected: boolean) => {
		newRoom["is_permanent"] = isFirstOptionSelected;
	};

	const handleToggleChange2 = (isFirstOptionSelected: boolean) => {
		newRoom["is_private"] = !isFirstOptionSelected;
	};

	const navigateToRoomDetails = () => {
		if (isSwitched) {
			newRoom["start_date"] = startDate ?? null;
			newRoom["end_date"] = endDate ?? null;

			if (!startDate && !endDate) {
				Platform.OS === "web"
					? alert("Please select a start or end date")
					: ToastAndroid.show(
							"Please select a start or end date",
							ToastAndroid.SHORT,
						);
				return;
			}

			if (startDate && endDate && startDate >= endDate) {
				Platform.OS === "web"
					? alert("Start date must be before end date")
					: ToastAndroid.show(
							"Start date must be before end date",
							ToastAndroid.SHORT,
						);
				return;
			}

			if (startDate && startDate < new Date()) {
				Platform.OS === "web"
					? alert("Start date must be in the future")
					: ToastAndroid.show(
							"Start date must be in the future",
							ToastAndroid.SHORT,
						);
				return;
			}

			if (endDate && endDate < new Date()) {
				alert("End date must be in the future");
				return;
			}
		}

		newRoom["is_scheduled"] = isSwitched;
		const room = JSON.stringify(newRoom);
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
							<Switch
								value={isSwitched}
								onValueChange={setIsSwitched}
								thumbColor={isSwitched ? "#fffff" : "#ffffff"}
								trackColor={{ false: "#767577", true: colors.primary }}
							/>
						</View>
						{isSwitched && (
							<View style={styles.dateTimePickerContainer}>
								<DateTimePickerComponent
									startDate={startDate}
									setStartDate={setStartDate}
									endDate={endDate}
									setEndDate={setEndDate}
								/>
								<TouchableOpacity
									style={styles.clearDatesButton} // Make it a button
									onPress={() => {
										setStartDate(undefined);
										setEndDate(undefined);
									}}
								>
									<Text style={styles.clearDatesButtonText}>Clear dates</Text>
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
	clearDatesButton: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: colors.primary,
		borderRadius: 5,
		marginTop: 10,
		alignSelf: "center", // Center the button
	},
	clearDatesButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
		textAlign: "center",
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
	},
	scheduleText: {
		fontSize: 16,
		fontWeight: "bold",
	},
	dateTimePickerContainer: {
		marginTop: 0,
		zIndex: 1,
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
};

export default CreateRoomScreen;
