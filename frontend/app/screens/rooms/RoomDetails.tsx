import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TextInput,
	Switch,
	TouchableOpacity,
	Dimensions,
	ScrollView,
	StyleSheet,
	Image,
	Alert,
	Platform,
	ToastAndroid,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { RoomDetailsProps } from "../../models/roomdetails";
import uploadImage from "../../services/ImageUpload";
import auth from "../../services/AuthManagement"; // Import AuthManagement
import * as utils from "../../services/Utils"; // Import Utils
import CyanButton from "../../components/CyanButton";
import { colors } from "../../styles/colors";
import CreateButton from "../../components/CreateButton";
import { start } from "repl";
import EditGenreBubble from "../../components/EditGenreBubble";
import GenreAdder from "../../components/GenreAdder";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Room } from "../../models/Room";

const RoomDetails: React.FC = () => {
	const router = useRouter();
	const [genres, setGenres] = useState<string[]>([]);
	const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
	const [isGenreDialogVisible, setIsGenreDialogVisible] = useState(false);
	const { room } = useLocalSearchParams();
	// console.log('room', room)
	let newRoom = JSON.parse(room as string);
	newRoom = {
		...newRoom,
		start_date: newRoom.start_date
			? new Date(newRoom.start_date).toISOString()
			: undefined,
		end_date: newRoom.end_date
			? new Date(newRoom.end_date).toISOString()
			: undefined,
	};
	console.log("roomooo", newRoom.start_date, newRoom.end_date);

	const [roomDetails, setRoomDetails] = useState<RoomDetailsProps>({
		name: "",
		description: "",
		tags: [],
		language: "",
		roomSize: 55,
		isExplicit: false,
		isNsfw: false,
		isPrivate: false,
		isScheduled: false,
		start_date: new Date(),
		end_date: new Date(),
		date_created: new Date(),
	});

	const [image, setImage] = useState<string | null>(null);

	const screenWidth = Dimensions.get("window").width;
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
	}, []);
	const addGenres = (genresToAdd: string[]) => {
		roomDetails.tags = [...roomDetails.tags, ...genresToAdd];
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
		roomDetails.tags = roomDetails.tags.filter((g: string) => g !== genre);
		setGenres([...genres, genre]);
		setSelectedGenres(selectedGenres.filter((g: string) => g !== genre));
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
		// create room here i guess?
		//const roomID: string = '777b6f7c-71f3-4ad5-849b-5eea361d7d87';
		//const room: RoomDto = // get room info
		/*
    const roomInfo = '{"creator":{"profile_name":"kane","userID":"413c6268-6051-7024-2806-f4627605df0b","username":"@gmail.com","profile_picture_url":"https://images.unsplash.com/photo-1628563694622-5a76957fd09c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwcm9maWxlLWxpa2VkfDF8fHxlbnwwfHx8fHw%3D","followers":{"count":0,"data":[]},"following":{"count":0,"data":[]},"links":{"count":0,"data":[]},"bio":"im new","current_song":{"title":"","artists":[],"cover":"","start_time":"2024-06-20T19:09:23.506Z"},"fav_genres":{"count":0,"data":[]},"fav_songs":{"count":0,"data":[]},"fav_rooms":{"count":0,"data":[]},"recent_rooms":{"count":0,"data":[]}},"roomID":"777b6f7c-71f3-4ad5-849b-5eea361d7d87","participant_count":0,"room_name":"\'Concrete Boys\' album listening session","description":"We will be gathering to listen to the new album by Lil Yatchy\'s eclectic new collective \'Concrete Boys\'","is_temporary":true,"is_private":false,"is_scheduled":false,"start_date":"2024-06-20T19:09:23.431Z","end_date":"2024-06-20T19:09:23.431Z","language":"English","has_explicit_content":true,"has_nsfw_content":false,"room_image":"https://media.pitchfork.com/photos/66143cc84fbf8f78dfee2468/16:9/w_1280,c_limit/Concrete%20Boys-%20It\'s%20Us%20Vol.%201.jpg","current_song":{"title":"","artists":[],"cover":"","start_time":"2024-06-20T19:09:23.431Z"},"tags":[]}';
    router.navigate({
      pathname: 'ChatRoom',
      params: { room: roomInfo },
    });
    */

		newRoom["has_nsfw_content"] = roomDetails.isNsfw;
		console.log("Room Details FROM ROOM DETAILS PAGE:", roomDetails.language);
		if (roomDetails.language !== "") {
			console.log("Language:", roomDetails.language);
			newRoom["language"] = roomDetails.language;
		} else {
			console.log("Language:", "English");
			newRoom["language"] = "English";
		}
		if (roomDetails.tags) newRoom["tags"] = roomDetails.tags;
		else {
			// delete genre field from newRoom
			delete newRoom["genre"];
		}
		if (roomDetails.description !== "")
			newRoom["description"] = roomDetails.description;
		else {
			newRoom["description"] = "This room has no description.";
		}
		newRoom["has_explicit_content"] = roomDetails.isExplicit;
		newRoom["room_name"] = roomDetails.name;
		newRoom["room_size"] = roomDetails.roomSize;
		let imageURL: string | undefined | null = "";
		if (newRoom["room_name"] === "" || newRoom["room_name"] === undefined) {
			// alert user to enter room name
			Alert.alert(
				"Room Name Required",
				"Please enter a room name.",
				[{ text: "OK" }],
				{ cancelable: false },
			);
			return;
		}
		if (image !== null) {
			imageURL = await uploadImage(image, roomDetails.name);
			// console.log('Image URL:', imageURL);
		}
		newRoom["room_image"] = imageURL;
		const token = await auth.getToken();
		// console.log('Token:', token);
		console.log("New Room:", JSON.stringify(newRoom));
		fetch(`${utils.API_BASE_URL}/users/rooms`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				// handle cors error
				"Access-Control-Allow-Origin": "*",

				Authorization: `Bearer ${token}` || "",
			},
			body: JSON.stringify(newRoom),
		})
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					if (Platform.OS === "web") {
						alert("Failed to create room. Please try again.");
					} else {
						ToastAndroid.show(
							"Failed to create room. Please try again.",
							ToastAndroid.SHORT,
						);
					}
					return null;
				}
			})
			.then((data) => {
				router.navigate({
					pathname: "/screens/(tabs)/Home",
					params: data,
				});
			})
			.catch((error) => {
				console.error("Error:", error);
			});
		// router.navigate("/screens/ChatRoom");
	};

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result.assets[0].uri);
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
					<Text style={{ fontSize: 16, fontWeight: "bold", paddingBottom: 0 }}>
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
					<CreateButton title="Share" onPress={saveChanges} />
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
			<Switch
				value={value}
				onValueChange={onChange}
				thumbColor={value ? "#fffff" : "#ffffff"} // Thumb color when active/inactive
				trackColor={{ false: "#767577", true: colors.primary }} // Track color for false/true
			/>
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
export default RoomDetails;
