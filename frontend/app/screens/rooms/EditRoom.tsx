import React, { useState, useEffect, useMemo } from "react";
import { useRoute, RouteProp } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Room } from "../../models/Room";
import * as ImagePicker from "expo-image-picker";
import uploadImage from "../../services/ImageUpload";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import {
	View,
	Text,
	TextInput,
	Switch,
	TouchableOpacity,
	Dimensions,
	ScrollView,
	Image,
	StyleSheet,
	Alert,
	ToastAndroid,
} from "react-native";
import CreateButton from "../../components/CreateButton";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import axios from "axios";
import { get } from "http";
import GenreAdder from "../../components/GenreAdder";
import EditGenreBubble from "../../components/EditGenreBubble";

type EditRoomRouteProp = RouteProp<{ params: { room: string } }, "params">;

const EditRoom: React.FC = () => {
	const router = useRouter();
	const route = useRoute<EditRoomRouteProp>();
	const { params } = route;

	// Memoize roomData to avoid re-parsing on each render
	const roomData = useMemo(() => JSON.parse(params.room), [params.room]);
	const [isGenreDialogVisible, setIsGenreDialogVisible] = useState(false);
	const [genres, setGenres] = useState<string[]>([]);
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [changedImage, setChangedImage] = useState<boolean>(false);
	const [roomDetails, setRoomDetails] = useState<Room>({
		roomID: "",
		name: "",
		description: "",
		backgroundImage: "",
		language: "",
		tags: [],
		userID: "",
		roomSize: 50,
		isExplicit: false,
		isNsfw: false,
		start_date: new Date(),
		end_date: new Date(),
		date_created: new Date(),
		childrenRoomIDs: [],
		userProfile: "",
		username: "",
		mine: false,
		isPrivate: false,
	});
	const [image, setImage] = useState<string | null>(null);

	// useEffect without roomDetails as dependency
	useEffect(() => {
		const getGenres = async () => {
			try {
				const token = await auth.getToken();

				if (token) {
					const response = await axios.get(`${utils.API_BASE_URL}/genres`, {
						headers: {
							Authorization: `Bearer ${token}`,
						},
					});
					console.log("Genre data", response.data);
					setGenres(response.data);
				}
			} catch (error) {
				console.log("Error fetching genres:", error);
			}
		};
		getGenres();
	}, []); // Empty dependency array
	useEffect(() => {
		const loadRoomDetails = async () => {
			console.log("roomData inside the edit room page", roomData);
			setRoomDetails({
				roomID: roomData.id ?? roomData.roomID,
				name: roomData.name,
				description: roomData.description,
				backgroundImage: roomData.backgroundImage,
				language: roomData.language,
				tags: roomData.tags,
				userID: roomData.userID,
				roomSize: roomData.roomSize,
				isExplicit: roomData.isExplicit,
				isNsfw: roomData.isNsfw,
				start_date: roomData.start_date,
				end_date: roomData.end_date,
				date_created: roomData.date_created,
				childrenRoomIDs: roomData.childrenRoomIDs,
				userProfile: roomData.userProfile,
				username: roomData.username,
				mine: roomData.mine,
				isPrivate: roomData.isPrivate,
			});
			setSelectedGenres(
				roomData.tags.filter((g: string) => genres.includes(g)),
			);
			setImage(roomData.backgroundImage as string);
		};

		loadRoomDetails();
	}, [roomData, genres]); // Only roomData is a dependency now

	const addGenres = (genresToAdd: string[]) => {
		roomData.tags = [...roomData.tags, ...genresToAdd];
		setGenres(genres.filter((g) => !genresToAdd.includes(g)));
		setSelectedGenres([...selectedGenres, ...genresToAdd]);
		setIsGenreDialogVisible(false);
	};
	const toggleGenreSelector = () => {
		if (isGenreDialogVisible) {
			setIsGenreDialogVisible(false);
		} else {
			setIsGenreDialogVisible(true);
		}
	};

	const removeGenre = (genre: string) => {
		roomData.tags = roomData.tags.filter((g: string) => g !== genre);
		setGenres([...genres, genre]);
		setSelectedGenres(selectedGenres.filter((g: string) => g !== genre));
	};

	const screenWidth = Dimensions.get("window").width;
	const navigateToEditPlaylist = () => {
		router.navigate("/screens/rooms/EditPlaylist");
	};
	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setChangedImage(true);
			setImage(result.assets[0].uri);
		}
	};

	const handleInputChange = (field: keyof Room, value: string | boolean) => {
		if (field === "roomSize") {
			setRoomDetails({
				...roomDetails,
				[field]: !Number.isNaN(Number(value)) ? Number(value) : 0,
			});
		} else {
			setRoomDetails({ ...roomDetails, [field]: value });
		}
	};

	const handleToggleChange = (field: keyof Room, value: boolean) => {
		setRoomDetails({ ...roomDetails, [field]: value });
	};

	const saveChanges = async () => {
		const newRoom: Partial<Room> = {
			description: roomDetails.description,
			isExplicit: roomDetails.isExplicit,
			language: roomDetails.language,
			isNsfw: roomDetails.isNsfw,
			name: roomDetails.name,
		};

		if (!newRoom.name) {
			Alert.alert(
				"Room Name Required",
				"Please enter a room name.",
				[{ text: "OK" }],
				{ cancelable: false },
			);
			return;
		}

		if (changedImage && image) {
			let newImage = await uploadImage(image, roomDetails.name);
			if (newImage) {
				newRoom.backgroundImage = newImage;
			}
		}
		const token = await auth.getToken();
		try {
			const data = await fetch(
				`${utils.API_BASE_URL}/rooms/${roomData.id ?? roomData.roomID}`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer " + token,
					},
					body: JSON.stringify({
						room_name: newRoom.name,
						description: newRoom.description,
						has_explicit_content: newRoom.isExplicit,
						has_nsfw_content: newRoom.isNsfw,
						room_image: newRoom.backgroundImage,
						language: newRoom.language,
						tags: roomData.tags,
						room_size: roomDetails.roomSize,
					}),
				},
			);
			if (!data.ok) {
				Alert.alert(
					"Error",
					"An error occurred while saving your changes.",
					[{ text: "OK" }],
					{ cancelable: false },
				);
				alert("An error occurred while saving your changes.");
				return;
			}
			Alert.alert(
				"Changes Saved",
				"Your changes have been saved successfully.",
				[{ text: "OK" }],
				{ cancelable: false },
			);
			router.navigate("/screens/(tabs)/Home");
		} catch (error) {
			console.log("Error:", error);
			ToastAndroid.show("Failed to update room data.", ToastAndroid.SHORT);
		}
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollView}>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()}>
						{/* <Text style={styles.closeButton}>×</Text>
						 */}
						<Ionicons name="chevron-back" size={24} color="#000" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Edit Room Details</Text>
					<View style={styles.headerSpacer} />
				</View>
				<View style={styles.form}>
					{buildInputField("Room Name", roomDetails.name, (value) =>
						handleInputChange("name", value),
					)}
					{buildInputField(
						"Description",
						roomDetails.description,
						(value) => handleInputChange("description", value),
						2,
					)}
					<Text style={{ fontSize: 16, fontWeight: "bold", paddingBottom: 10 }}>
						Genres
					</Text>
					<View style={styles.chipsContainer}>
						{selectedGenres?.map((genre, index) => (
							<EditGenreBubble
								key={index}
								text={genre}
								onPress={() => removeGenre(genre)}
							/>
						))}
						{/* Render add genre button */}
						<TouchableOpacity
							onPress={toggleGenreSelector}
							style={styles.addGenreButton}
							testID="add-genre"
						>
							<Text
								style={{
									color: "black",
									fontWeight: "500",
									fontSize: 14,
								}}
							>
								Add +
							</Text>
						</TouchableOpacity>
						<GenreAdder
							options={genres}
							placeholder={"Search Genres"}
							visible={isGenreDialogVisible}
							onSelect={addGenres}
							onClose={toggleGenreSelector}
						/>
					</View>
					{buildInputField("Language", roomDetails.language ?? "", (value) =>
						handleInputChange("language", value),
					)}
					{buildInputField(
						"Room Size",
						roomDetails.roomSize?.toString() ?? "55",
						(value) => handleInputChange("roomSize", value),
					)}
					{buildToggle("Explicit", roomDetails.isExplicit ?? false, () =>
						handleToggleChange("isExplicit", !roomDetails.isExplicit),
					)}
					{buildToggle("NSFW", roomDetails.isNsfw ?? false, () =>
						handleToggleChange("isNsfw", !roomDetails.isNsfw),
					)}

					<View style={styles.imagePickerContainer}>
						<Text style={styles.imagePickerLabel}>Change Photo</Text>
						<TouchableOpacity
							onPress={pickImage}
							style={styles.imagePickerButton}
						>
							<View style={styles.imagePickerButtonContent}>
								<Text>Select Photo</Text>
							</View>
						</TouchableOpacity>
						{image && (
							<Image
								source={{ uri: image }}
								style={[styles.imagePreview, { width: screenWidth - 60 }]}
							/>
						)}
					</View>
					<CreateButton title="Save Changes" onPress={saveChanges} />
					<CreateButton
						title="Edit Playlist"
						onPress={navigateToEditPlaylist}
					/>
				</View>
			</View>
		</ScrollView>
	);
};

const buildInputField = (
	labelText: string,
	value: string,
	onChange: (value: string) => void,
	maxLines = 1,
) => {
	return (
		<View style={styles.inputFieldContainer}>
			<Text style={styles.inputFieldLabel}>{labelText}</Text>
			{labelText === "Room Size" ? (
				<View>
					<TextInput
						style={styles.inputField}
						placeholder={`Add ${labelText.toLowerCase()}`}
						value={Number.isNaN(Number(value)) ? "" : value}
						onChangeText={onChange}
						keyboardType="numeric"
					/>
					{Number.isNaN(Number(value)) !== false && (
						<Text style={[styles.errorMessage]}>
							{"Please enter a numerical value"}
						</Text>
					)}
				</View>
			) : (
				<TextInput
					style={styles.inputField}
					placeholder={`Add ${labelText.toLowerCase()}`}
					value={value}
					onChangeText={onChange}
					multiline={maxLines > 1}
					numberOfLines={maxLines}
				/>
			)}
		</View>
	);
};

const buildToggle = (
	labelText: string,
	value: boolean,
	onChange: (value: boolean) => void,
) => {
	return (
		<View style={styles.toggleContainer}>
			<Text style={styles.toggleLabel}>{labelText}</Text>
			<Switch value={value} onValueChange={onChange} />
		</View>
	);
};

const styles = StyleSheet.create({
	scrollView: {
		flexGrow: 1,
		backgroundColor: "white",
	},
	errorMessage: {
		marginTop: 10,
		// marginLeft: 85,
		color: "red",
	},
	container: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 40,
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
	addGenreButton: {
		marginRight: 12,
		marginBottom: 10,
		paddingHorizontal: 14,
		paddingVertical: 8,
		backgroundColor: "rgba(232, 235, 242, 1)",
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	headerSpacer: {
		width: 20,
	},
	headerPlaceholder: {
		width: 20,
	},
	form: {
		paddingHorizontal: 10,
		paddingVertical: 20,
	},
	inputFieldContainer: {
		marginBottom: 20,
	},
	inputFieldLabel: {
		fontSize: 16,
		fontWeight: "bold",
		paddingBottom: 10,
	},
	inputField: {
		borderWidth: 1,
		borderColor: colors.primary,
		borderRadius: 10,
		padding: 10,
		backgroundColor: "#F9FAFB",
	},
	toggleContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	toggleLabel: {
		fontSize: 16,
		fontWeight: "bold",
	},
	imagePickerContainer: {
		marginBottom: 20,
	},
	imagePickerLabel: {
		fontSize: 16,
		fontWeight: "bold",
		paddingBottom: 10,
	},
	imagePickerButton: {
		marginBottom: 10,
	},
	imagePickerButtonContent: {
		borderWidth: 1,
		borderColor: "#D1D5DB",
		borderRadius: 10,
		padding: 10,
		alignItems: "center",
	},
	imagePreview: {
		height: 200,
		borderRadius: 10,
	},
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 10,
	},
	saveButton: {
		backgroundColor: "#8B8FA8",
		borderRadius: 30,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		elevation: 5,
		marginTop: 10,
	},
	saveButtonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "white",
	},
});

export default EditRoom;
