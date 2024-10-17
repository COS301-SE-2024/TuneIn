import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Switch,
	TouchableOpacity,
	Dimensions,
	ScrollView,
	Image,
	Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { RoomDetailsProps } from "../../models/roomdetails";
import uploadImage from "../../services/ImageUpload";
import auth from "../../services/AuthManagement"; // Import AuthManagement
import * as utils from "../../services/Utils"; // Import Utils
import { colors } from "../../styles/colors";
import CreateButton from "../../components/CreateButton";

const RoomDetails: React.FC = () => {
	const router = useRouter();
	const { room } = useLocalSearchParams();
	// console.log('room', room)
	const newRoom = Array.isArray(room) ? JSON.parse(room[0]) : JSON.parse(room);
	// console.log('room', newRoom);

	const [roomDetails, setRoomDetails] = useState<RoomDetailsProps>({
		name: "",
		description: "",
		genre: "",
		language: "",
		roomSize: "50",
		isExplicit: false,
		isNsfw: false,
	});

	const [image, setImage] = useState<string | null>(null);

	const screenWidth = Dimensions.get("window").width;

	const navigateToChatRoom = async () => {
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
		if (roomDetails.genre !== "") newRoom["genre"] = roomDetails.genre;
		else {
			// delete genre field from newRoom
			delete newRoom["genre"];
		}
		if (roomDetails.description !== "")
			newRoom["description"] = roomDetails.description;
		else {
			newRoom["description"] = "";
		}
		newRoom["has_explicit_content"] = roomDetails.isExplicit;
		newRoom["room_name"] = roomDetails.name;
		let imageURL = "";
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
			imageURL = (await uploadImage(image, roomDetails.name)) ?? ""; // Provide a default empty string
			// console.log('Image URL:', imageURL);
		}

		newRoom["room_image"] = imageURL;
		const token = await auth.getToken();
		// console.log('Token:', token);
		fetch(`${utils.API_BASE_URL}/users/rooms`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}` || "",
			},
			body: JSON.stringify(newRoom),
		})
			.then((response) => response.json())
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

	const handleInputChange = (
		field: keyof RoomDetailsProps,
		value: string | boolean,
	) => {
		setRoomDetails({ ...roomDetails, [field]: value });
	};

	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1, backgroundColor: "white" }}
		>
			<View
				style={{
					flex: 1,
					paddingHorizontal: 20,
					paddingTop: 20,
					paddingBottom: 40,
				}}
			>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						padding: 10,
					}}
				>
					<TouchableOpacity onPress={() => router.back()}>
						<Text style={{ fontSize: 20, fontWeight: "bold" }}>×</Text>
					</TouchableOpacity>
					<Text style={{ fontSize: 20, fontWeight: "bold" }}>Room Details</Text>
					<View style={{ width: 20 }} />
				</View>
				<View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
					{_buildInputField("Room Name (required)", roomDetails.name, (value) =>
						handleInputChange("name", value),
					)}
					{_buildInputField(
						"Description",
						roomDetails.description,
						(value) => handleInputChange("description", value),
						4,
					)}
					{_buildInputField("Genre", roomDetails.genre, (value) =>
						handleInputChange("genre", value),
					)}
					{_buildInputField("Language", roomDetails.language, (value) =>
						handleInputChange("language", value),
					)}
					{_buildInputField("Room Size", roomDetails.roomSize, (value) =>
						handleInputChange("roomSize", value),
					)}
					{_buildToggle("Explicit", roomDetails.isExplicit, (value) =>
						handleInputChange("isExplicit", value),
					)}
					{_buildToggle("NSFW", roomDetails.isNsfw, (value) =>
						handleInputChange("isNsfw", value),
					)}

					<View style={{ marginBottom: 20 }}>
						<Text
							style={{ fontSize: 16, fontWeight: "bold", paddingBottom: 10 }}
						>
							Add a Photo
						</Text>
						<TouchableOpacity onPress={pickImage} style={{ marginBottom: 10 }}>
							<View
								style={{
									borderWidth: 1,
									borderColor: "#D1D5DB",
									borderRadius: 10,
									padding: 10,
									alignItems: "center",
								}}
							>
								<Text>Select Photo</Text>
							</View>
						</TouchableOpacity>
						{image && (
							<Image
								source={{ uri: image }}
								style={{
									width: screenWidth - 60,
									height: 200,
									borderRadius: 10,
								}}
							/>
						)}
					</View>
					<CreateButton title="Share" onPress={navigateToChatRoom} />
				</View>
			</View>
		</ScrollView>
	);
};

const _buildInputField = (
	labelText: string,
	value: string,
	onChange: (value: string) => void,
	maxLines = 1,
) => {
	return (
		<View style={{ marginBottom: 20 }}>
			<Text style={{ fontSize: 16, fontWeight: "bold", paddingBottom: 10 }}>
				{labelText}
			</Text>
			<TextInput
				style={{
					borderWidth: 1,
					borderColor: colors.primary,
					borderRadius: 10,
					padding: 10,
					backgroundColor: "#F9FAFB",
				}}
				placeholder={`Add ${labelText.toLowerCase()}`}
				value={value}
				onChangeText={onChange}
				multiline={maxLines > 1}
				numberOfLines={maxLines}
			/>
		</View>
	);
};

const _buildToggle = (
	labelText: string,
	value: boolean,
	onChange: (value: boolean) => void,
) => {
	return (
		<View
			style={{
				flexDirection: "row",
				alignItems: "center",
				justifyContent: "space-between",
				marginBottom: 20,
			}}
		>
			<Text style={{ fontSize: 16, fontWeight: "bold" }}>{labelText}</Text>
			<Switch value={value} onValueChange={onChange} />
		</View>
	);
};

export default RoomDetails;
