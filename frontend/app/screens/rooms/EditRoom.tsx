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

type EditRoomRouteProp = RouteProp<{ params: { room: string } }, "params">;

const EditRoom: React.FC = () => {
	const router = useRouter();
	const route = useRoute<EditRoomRouteProp>();
	const { params } = route;

	// Memoize roomData to avoid re-parsing on each render
	const roomData = useMemo(() => JSON.parse(params.room), [params.room]);

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
	});
	const [image, setImage] = useState<string | null>(null);

	// useEffect without roomDetails as dependency
	useEffect(() => {
		const loadRoomDetails = async () => {
			setRoomDetails({
				roomID: roomData.id,
				name: roomData.name,
				description: roomData.description,
				backgroundImage: roomData.backgroundImage,
				language: roomData.language,
				tags: roomData.tags,
				userID: roomData.userID,
				roomSize: 50,
				isExplicit: roomData.isExplicit,
				isNsfw: roomData.isNsfw,
			} as Room);
			setImage(roomData.backgroundImage as string);
		};

		loadRoomDetails();
	}, [roomData]); // Only roomData is a dependency now

	const screenWidth = Dimensions.get("window").width;
	const navigateToEditPlaylist = () => {
		router.navigate("/screens/EditPlaylist");
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
			setRoomDetails({ ...roomDetails, [field]: Number(value) });
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
			const data = await fetch(`${utils.API_BASE_URL}/rooms/${roomData.id}`, {
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
				}),
			});
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
					{/* <TouchableOpacity onPress={() => router.back()}>
						<Text style={styles.closeButton}>×</Text>
					</TouchableOpacity> */}
					<Text style={styles.headerTitle}>Edit Room Details</Text>
					<View style={styles.headerPlaceholder} />
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
					{buildInputField("Genre", roomDetails.genre ?? "", (value) =>
						handleInputChange("genre", value),
					)}
					{buildInputField("Language", roomDetails.language ?? "", (value) =>
						handleInputChange("language", value),
					)}
					{buildInputField("Room Size", "50".toString(), (value) =>
						handleInputChange("roomSize", value),
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

					<TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
						<Text style={styles.saveButtonText}>Save Changes</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.saveButton}
						onPress={navigateToEditPlaylist}
					>
						<Text style={styles.saveButtonText}>Edit Playlist</Text>
					</TouchableOpacity>
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
			<TextInput
				style={styles.inputField}
				placeholder={`Add ${labelText.toLowerCase()}`}
				value={value}
				onChangeText={onChange}
				multiline={maxLines > 1}
				numberOfLines={maxLines}
			/>
		</View>
	);
};

const buildToggle = (
	labelText: string,
	value: boolean,
	onChange: (value: boolean) => void,
) => {
	console.log(labelText, value);
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
		borderColor: "#D1D5DB",
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
