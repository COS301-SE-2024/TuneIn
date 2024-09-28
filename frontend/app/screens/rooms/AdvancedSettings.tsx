import React, { useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Switch,
	Modal,
	Pressable,
	ToastAndroid,
	ScrollView,
	Platform,
	Alert,
} from "react-native";
import auth from "../../services/AuthManagement";
import { useLocalSearchParams, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import the icon
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import CreateButton from "../../components/CreateButton";
import DeleteButton from "../../components//DeleteButton";
import { colors } from "../../styles/colors";
import RoomShareSheet from "../../components/messaging/RoomShareSheet";
import { formatRoomData } from "../../models/Room";
import * as utils from "../../services/Utils";
import SplittingPopUp from "../../components/rooms/SplittingRoomPopUp";
import { Track } from "../../models/Track";
const placeholderImage = require("../../assets/spotify.png");

type Queues = {
	[key: string]: Track[];
};
const AdvancedSettings = () => {
	const router = useRouter();
	const [isPopupVisible, setPopupVisible] = useState(false);
	const [selectedOption, setSelectedOption] = useState(null);
	const [toggle1, setToggle1] = useState(true);
	const [toggle2, setToggle2] = useState(true);
	const [toggle3, setToggle3] = useState(true);
	const [toggle4, setToggle4] = useState(true);
	const [genres, setGenres] = useState<string[]>([]);

	const { room } = useLocalSearchParams();

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
		const formattedRoom = formatRoomData(JSON.parse(room as string));
		router.navigate({
			pathname: "/screens/rooms/EditRoom",
			params: { room: JSON.stringify(formattedRoom) },
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

	const deleteRoom = async (roomID: string) => {
		const token = await auth.getToken();
		try {
			await fetch(`${utils.API_BASE_URL}/rooms/${roomID}`, {
				method: "DELETE",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			// Show toast on Android, alert on other platforms
			if (Platform.OS === "android" && ToastAndroid) {
				ToastAndroid.show("Room deleted successfully.", ToastAndroid.SHORT);
			} else {
				Alert.alert("Success", "Room deleted successfully.");
			}
		} catch (error) {
			console.log("Error deleting room: ", error);

			// Handle toast on Android, alert on other platforms
			if (Platform.OS === "android" && ToastAndroid) {
				ToastAndroid.show("Failed to delete room", ToastAndroid.SHORT);
			} else {
				Alert.alert("Error", "Failed to delete room.");
			}
		}
	};
	const getRoom = async (roomID: string) => {
		const token = await auth.getToken();
		try {
			const response = await fetch(`${utils.API_BASE_URL}/rooms/${roomID}`, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				if (Platform.OS === "android" && ToastAndroid) {
					ToastAndroid.show(await response.text(), ToastAndroid.SHORT);
				} else {
					Alert.alert("Error", await response.text());
				}
				return null;
			}
			const data = await response.json();
			return {
				roomID: data.roomID,
				id: data.roomID,
				name: data.room_name,
				description: data.description,
				userID: data.creator.userID,
				username: data.creator.username,
				tags: data.tags,
				genre: data.room_name.split(" - ")[1],
				backgroundImage: data.room_image,
				isExplicit: data.has_explicit_content,
				isNsfw: data.has_nsfw_content,
				language: data.language,
				roomSize: "50",
				userProfile: data.creator.profile_picture_url,
				mine: true,
				songName: data.current_song ? data.current_song.title : null,
			};
		} catch (error) {
			console.log("Error getting room: ", error);
			if (Platform.OS === "android" && ToastAndroid) {
				ToastAndroid.show("Failed to get room", ToastAndroid.SHORT);
			} else {
				Alert.alert("Error", "Failed to get room.");
			}
		}
	};

	const getRoomQueue = async (roomID: string) => {
		const token = await auth.getToken();
		try {
			const response = await fetch(
				`${utils.API_BASE_URL}/rooms/${roomID}/songs`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!response.ok) {
				if (Platform.OS === "android" && ToastAndroid) {
					ToastAndroid.show(await response.text(), ToastAndroid.SHORT);
				} else {
					Alert.alert("Error", await response.text());
				}
				return null;
			}
			const data = await response.json();
			const queue = data.map((song: any) => {
				const cover = song.cover;
				return {
					id: song.id,
					name: song.title,
					artists: song.artists.map((artist: string) => ({ name: artist })), // Convert artist string to object
					album: { images: [{ url: cover }] },
					explicit: false,
					preview_url: "",
					uri: `spotify:track:${song.spotify_id}`,
					duration_ms: song.duration * 1000,
					albumArtUrl: placeholderImage,
				};
			});
			return queue;
		} catch (error) {
			console.log("Error getting room queue: ", error);
			if (Platform.OS === "android" && ToastAndroid) {
				ToastAndroid.show("Failed to get room queue", ToastAndroid.SHORT);
			} else {
				Alert.alert("Error", "Failed to get room queue.");
			}
		}
	};
	const navigateToSplittingRoom = async () => {
		const token = auth.getToken();
		try {
			if (room) {
				let roomData = typeof room === "string" ? JSON.parse(room) : room;
				if (Array.isArray(roomData)) {
					roomData = JSON.parse(roomData[0]);
				}
				const response = await fetch(
					`${utils.API_BASE_URL}/rooms/${roomData.id ?? roomData.roomID}/split`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				if (!response.ok) {
					if (Platform.OS === "android" && ToastAndroid) {
						ToastAndroid.show(await response.text(), ToastAndroid.SHORT);
					} else {
						Alert.alert("Error", await response.text());
					}
					return;
				} else {
					const data = await response.json();
					const childRoom1 = await getRoom(data.childrenRoomIDs[0]);
					const childRoom2 = await getRoom(data.childrenRoomIDs[1]);
					if (childRoom1 && childRoom2) {
						const childRoom1Queue = await getRoomQueue(childRoom1.id);
						const childRoom2Queue = await getRoomQueue(childRoom2.id);
						if (childRoom1Queue && childRoom2Queue) {
							router.navigate({
								pathname: "/screens/rooms/SplittingRoom",
								params: {
									rooms: JSON.stringify([childRoom1, childRoom2]),
									queues: JSON.stringify([childRoom1Queue, childRoom2Queue]),
								},
							});
						} else {
							console.log("No queue data found");
						}
					} else {
						console.log("No room data found");
					}
				}
			} else {
				console.log("No room data found");
			}
		} catch (error) {
			console.log("Error splitting room: ", error);
			if (Platform.OS === "android" && ToastAndroid) {
				ToastAndroid.show("Failed to split room", ToastAndroid.SHORT);
			} else {
				Alert.alert("Error", "Failed to split room.");
			}
		}
	};
	const handleConfirmPopup = async (choice: boolean) => {
		console.log("User choice:", choice ? "Yes" : "No");
		if (choice) {
			// Navigate to splitting room or handle "Yes" action
			navigateToSplittingRoom();
		} else {
			// Handle "No" action (cancel)
			handleClosePopup();
		}
	};
	const handleDelete = () => {
		setShowDeleteModal(false);
		if (room) {
			let roomData = typeof room === "string" ? JSON.parse(room) : room;
			if (Array.isArray(roomData)) {
				roomData = JSON.parse(roomData[0]);
			}
			deleteRoom(roomData.id);
			navigateToHome();
		} else {
			console.log("No room data found");
		}
	};

	const checkRoomSplit = async () => {
		try {
			if (room) {
				let roomData = typeof room === "string" ? JSON.parse(room) : room;
				if (Array.isArray(roomData)) {
					roomData = JSON.parse(roomData[0]);
				}
				console.log("Room data to check splitting: ", roomData);
				const token = await auth.getToken();
				const response = await fetch(
					`${utils.API_BASE_URL}/rooms/${roomData.id ?? roomData.roomID}/split`,
					{
						method: "GET",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				if (!response.ok) {
					const message = JSON.parse(await response.text()).message;
					ToastAndroid.show(message, ToastAndroid.SHORT);
					console.log(message);
					return;
				}
				const data = await response.json();
				if (data.length > 1) {
					setGenres(data);
					setPopupVisible(true);
				} else {
					ToastAndroid.show(
						"Room has no queue to split. Maybe get some bitches?",
						ToastAndroid.SHORT,
					);
				}
			} else {
				console.log("No room data found");
			}
		} catch (error) {
			console.log("Error splitting room: ", error);
			ToastAndroid.show("Failed to split room", ToastAndroid.SHORT);
		}
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
				room={formatRoomData(room)}
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
				<TouchableOpacity style={styles.editButton} onPress={checkRoomSplit}>
					<Text style={styles.editButtonText}>Split Room</Text>
					<Icon name="room" size={20} color="black" />
				</TouchableOpacity>
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
					<Pressable
						style={styles.modalContainer}
						onPress={() => setShowDeleteModal(false)} // Close modal when pressing outside
					>
						{/* Prevent the modal content from closing when pressed */}
						<Pressable style={styles.modalView} onPress={() => {}}>
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
						</Pressable>
					</Pressable>
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
			<SplittingPopUp
				isVisible={isPopupVisible}
				onClose={handleClosePopup}
				onConfirm={handleConfirmPopup}
				genres={genres}
			/>
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
		justifyContent: "flex-end", // Align modal to the bottom
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalView: {
		width: "100%", // Make it take full width of the screen
		height: "28%", // Increase the height, you can adjust this to your needs
		backgroundColor: "white",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		paddingBottom: 40,
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
		marginTop: 10,
		fontSize: 16,
		textAlign: "center",
		fontWeight: "bold",
	},
	modalButtonContainer: {
		marginTop: 45,
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
		backgroundColor: "red",
		borderRadius: 25,
	},
	buttonNo: {
		backgroundColor: colors.secondary,
		borderRadius: 25,
	},
	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
});

export default AdvancedSettings;
