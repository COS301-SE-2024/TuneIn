import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Switch,
	Modal,
	Pressable,
	ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import CreateButton from "../../components/CreateButton";
import DeleteButton from "../../components//DeleteButton";
import { colors } from "../../styles/colors";
import RoomShareSheet from "../../components/messaging/RoomShareSheet";
import { formatRoomData } from "../../models/Room";

const AdvancedSettings = () => {
	const router = useRouter();
	const [isPopupVisible, setPopupVisible] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [toggle1, setToggle1] = useState(true);
	const [toggle2, setToggle2] = useState(true);
	const [toggle3, setToggle3] = useState(true);
	const [toggle4, setToggle4] = useState(true);

	const { room } = useLocalSearchParams();

	let roomData;
	try {
		roomData = typeof room === "string" ? JSON.parse(room) : room;
	} catch (error) {
		console.error("Invalid room data:", error);
		roomData = null;
	}

	const handleOptionSelect = (option: any) => {
		setSelectedOption(option);
	};

	const handleOpenPopup = () => {
		setPopupVisible(true);
	};

	const toggleSwitch1 = () => setToggle1((previousState) => !previousState);
	const toggleSwitch2 = () => setToggle2((previousState) => !previousState);
	const toggleSwitch3 = () => setToggle3((previousState) => !previousState);
	const toggleSwitch4 = () => setToggle4((previousState) => !previousState);

	const goToEditScreen = () => {
		router.navigate({
			pathname: "/screens/rooms/EditRoom",
			params: { room: roomData },
		});
	};

	const handleClosePopup = () => {
		setPopupVisible(false);
	};

	const navigateToHome = () => {
		router.navigate("/screens/(tabs)/Home");
	};

	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showSaveModal, setShowSaveModal] = useState(false);

	const handleDelete = () => {
		setShowDeleteModal(false);
		navigateToHome(); // Proceed to delete and navigate home
	};

	const handleSave = () => {
		setShowSaveModal(true); // Open the save modal
	};

	const closeSaveModal = () => {
		setShowSaveModal(false);
		router.back(); // Navigate back when the modal is closed
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					{/* <Text style={styles.closeButton}>×</Text> */}
					<MaterialCommunityIcons
						name="window-close"
						size={24}
						color="black"
						testID="closeButton"
					/>
				</TouchableOpacity>
				<Text style={styles.headerText}>Advanced Settings</Text>
				<TouchableOpacity onPress={handleOpenPopup}>
					<Icon name="share" size={22} color={colors.primaryText} />
				</TouchableOpacity>
			</View>
			{/* Popup component */}
			<RoomShareSheet
				room={formatRoomData(roomData)}
				isVisible={isPopupVisible}
				onClose={handleClosePopup}
			/>
			<ScrollView>
				<Text style={styles.sectionHeader}>Who can join your room?</Text>
				<View style={styles.optionsContainer}>
					<TouchableOpacity
						style={[
							styles.option,
							selectedOption === 1 && styles.selectedOption,
						]}
						onPress={() => handleOptionSelect(1)}
					>
						<Text style={styles.optionText}>Everyone</Text>
						{selectedOption === 1 && <Text> ✓ </Text>}
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.option,
							selectedOption === 2 && styles.selectedOption,
						]}
						onPress={() => handleOptionSelect(2)}
					>
						<Text style={styles.optionText}>People with the link</Text>
						{selectedOption === 2 && <Text> ✓ </Text>}
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.option,
							selectedOption === 3 && styles.selectedOption,
						]}
						onPress={() => handleOptionSelect(3)}
					>
						<Text style={styles.optionText}>Friends and people you follow</Text>
						{selectedOption === 3 && <Text> ✓ </Text>}
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.option,
							selectedOption === 4 && styles.selectedOption,
						]}
						onPress={() => handleOptionSelect(4)}
					>
						<Text style={styles.optionText}>Only Friends</Text>
						{selectedOption === 4 && <Text> ✓ </Text>}
					</TouchableOpacity>
				</View>

				<View style={styles.toggleContainer}>
					<View style={styles.toggleItem}>
						<Text style={styles.toggleHeader}>Searchability</Text>
						<View style={styles.toggleSwitchContainer}>
							<Switch value={toggle1} onValueChange={toggleSwitch1} />
						</View>
						<Text style={styles.toggleDescription}>
							Make this room searchable
						</Text>
					</View>
					<View style={styles.toggleItem}>
						<Text style={styles.toggleHeader}>Listeners can add</Text>
						<View style={styles.toggleSwitchContainer}>
							<Switch value={toggle2} onValueChange={toggleSwitch2} />
						</View>
						<Text style={styles.toggleDescription}>
							Allow everyone to add tracks
						</Text>
					</View>
					<View style={styles.toggleItem}>
						<Text style={styles.toggleHeader}>Enable chat in room</Text>
						<View style={styles.toggleSwitchContainer}>
							<Switch value={toggle3} onValueChange={toggleSwitch3} />
						</View>
						<Text style={styles.toggleDescription}>
							Listeners can use chat functionality
						</Text>
					</View>
					<View style={styles.toggleItem}>
						<Text style={styles.toggleHeader}>Can vote</Text>
						<View style={styles.toggleSwitchContainer}>
							<Switch value={toggle4} onValueChange={toggleSwitch4} />
						</View>
						<Text style={styles.toggleDescription}>
							Listeners can vote for next song
						</Text>
					</View>
				</View>

				<TouchableOpacity style={styles.editButton} onPress={goToEditScreen}>
					<Text style={styles.editButtonText}>Edit Room Details</Text>
					<Icon name="edit" size={20} color="black" />
				</TouchableOpacity>

				{/* <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
				<Text style={styles.saveButtonText}>Save Changes</Text>
			</TouchableOpacity> */}
				<View style={styles.saveButton}>
					<CreateButton title="Save Changes" onPress={handleSave} />
					{/* <CreateButton title="Save Changes" onPress={() => router.back()} /> */}
					{/* <DeleteButton title="Delete Room" onPress={navigateToHome} /> */}
					<DeleteButton
						title="Delete Room"
						onPress={() => setShowDeleteModal(true)}
					/>
				</View>
				{/* Delete Confirmation Modal */}
				<Modal
					animationType="slide"
					transparent={true}
					visible={showDeleteModal}
					onRequestClose={() => setShowDeleteModal(false)}
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalView}>
							<Text style={styles.modalText}>
								Are you sure you want to delete this room? The room will be
								deleted forever.
							</Text>
							<View style={styles.modalButtonContainer}>
								<Pressable
									style={[styles.button, styles.buttonYes]}
									onPress={handleDelete}
								>
									<Text style={styles.textStyle}>Yes</Text>
								</Pressable>
								<Pressable
									style={[styles.button, styles.buttonNo]}
									onPress={() => setShowDeleteModal(false)}
								>
									<Text style={styles.textStyle}>No</Text>
								</Pressable>
							</View>
						</View>
					</View>
				</Modal>
				{/* Save Confirmation Modal */}
				<Modal
					animationType="fade"
					transparent={true}
					visible={showSaveModal}
					onRequestClose={closeSaveModal}
				>
					<View style={styles.modalContainer}>
						<View style={styles.modalViewS}>
							<TouchableOpacity
								onPress={closeSaveModal}
								style={styles.closeButtonS}
							>
								<MaterialCommunityIcons
									name="window-close"
									size={24}
									color="black"
								/>
							</TouchableOpacity>
							<Text style={styles.modalTextS}>Settings have been saved!</Text>
						</View>
					</View>
				</Modal>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "white",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
		paddingHorizontal: 10,
		paddingTop: 20,
	},
	closeButton: {
		fontSize: 20,
		fontWeight: "bold",
	},
	headerText: {
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		flex: 1,
	},
	sectionHeader: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 20,
	},
	optionsContainer: {
		marginTop: 10,
	},
	option: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 10,
	},
	closeButtonS: {
		position: "absolute",
		top: 10,
		left: 10,
	},
	selectedOption: {
		backgroundColor: "lightblue",
		borderRadius: 5,
		paddingHorizontal: 5,
	},
	optionText: {
		fontSize: 16,
	},
	toggleContainer: {
		marginTop: 20,
	},
	toggleItem: {
		marginBottom: 20,
	},
	toggleHeader: {
		fontSize: 16,
		fontWeight: "bold",
	},
	toggleSwitchContainer: {
		position: "absolute",
		right: 0,
		top: 0,
	},
	toggleDescription: {
		fontSize: 14,
		color: "grey",
		marginTop: 5,
	},
	editButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 0,
		marginTop: 20,
	},
	editButtonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "black",
		marginRight: 5,
	},
	saveButton: {
		// backgroundColor: "#08BDBD",
		// borderRadius: 24,
		// paddingVertical: 12,
		// alignItems: "center",
		marginTop: 32,
	},
	saveButtonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "white",
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalView: {
		width: 300,
		backgroundColor: "white",
		borderRadius: 10,
		padding: 20,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalViewS: {
		width: 300,
		backgroundColor: "white",
		borderRadius: 10,
		padding: 40,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTextS: {
		fontSize: 20,
		textAlign: "center",
		marginBottom: 15,
		fontWeight: "bold",
	},
	modalText: {
		fontSize: 16,
		textAlign: "center",
		marginBottom: 15,
		fontWeight: "bold",
	},
	modalButtonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	button: {
		borderRadius: 5,
		padding: 10,
		elevation: 2,
		width: "45%",
		alignItems: "center",
	},
	buttonYes: {
		backgroundColor: colors.primary,
	},
	buttonNo: {
		backgroundColor: colors.secondary,
	},
	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
});

export default AdvancedSettings;
