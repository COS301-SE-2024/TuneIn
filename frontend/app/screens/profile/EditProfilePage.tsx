import React, { useContext, useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import EditGenreBubble from "../../components/EditGenreBubble";
import EditDialog from "../../components/EditDialog";
import FavoriteSongs from "../../components/FavoriteSong";
import PhotoSelect from "../../components/PhotoSelect";
import Icons from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import uploadImage from "../../services/ImageUpload";
import auth from "../../services/AuthManagement"; // Import AuthManagement
import * as utils from "../../services/Utils"; // Import Utils
import Selector from "../../components/Selector";
import AddFavSong from "../../components/AddFavSong";
import { Player } from "../../PlayerContext";

const EditProfileScreen = () => {
	const router = useRouter();
	const params = useLocalSearchParams();
	// console.log("Profile :", params);
	const profile = Array.isArray(params.profile)
		? params.profile[0]
		: params.profile;
	const profileInfo = JSON.parse(profile as string);

	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { setUserData } = playerContext;

	const [profileData, setProfileData] = useState(profileInfo);
	const [genres, setGenres] = useState<string[]>([]);
	const [isBioDialogVisible, setBioDialogVisible] = useState(false);
	const [isNameDialogVisible, setNameDialogVisible] = useState(false);
	const [isUsernameDialogVisible, setUsernameDialogVisible] = useState(false);
	const [isPhotoDialogVisible, setPhotoDialogVisible] = useState(false);
	const [isLinkAddDialogVisible, setLinkAddDialogVisible] = useState(false);
	const [isLinkEditDialogVisible, setLinkEditDialogVisible] = useState(false);
	const [isGenreDialogVisible, setIsGenreDialogVisible] = useState(false);
	const [isSongDialogVisible, setIsSongDialogVisible] = useState(false);

	const [token, setToken] = useState<string | null>(null);
	useEffect(() => {
		const getTokenAndData = async () => {
			try {
				const storedToken = await auth.getToken();
				setToken(storedToken);
			} catch (error) {
				console.error("Failed to retrieve token:", error);
			}
		};

		getTokenAndData();
	}, []);

	const updateProfile = async (changed) => {
		// console.log("Changed: " + JSON.stringify(profileData));
		if (changed) {
			try {
				const response = await axios.patch(
					`${utils.API_BASE_URL}/users`,
					profileData,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				// console.log(response.data);
				return response.data;
			} catch (error) {
				console.error("Error updating profile info:", error);
				return [];
			}
		}
	};

	const handleImageUpload = async (uri) => {
		// console.log(uri);
		try {
			// Fetch the file from the URI
			// const response = await fetch(uri);
			// const blob = await response.blob();
			// const fileName = uri.split('/').pop(); // Extract filename from URI

			// Append the file to the FormData
			// form.append("file", new File([blob], fileName, { type: blob.type }));
			const t = await auth.getToken();
			setToken(t);

			/*
			const uploadResponse = await axios.post(
				`${utils.API_BASE_URL}/upload`,
				form,
				{ headers },
			);
			*/
			// console.log(profileData);
			// console.log("Uploading image...", uri);
			const imageLink = await uploadImage(uri, "image");
			// console.log("image link:", imageLink);
			// console.log("File uploaded successfully", uploadResponse.data);
			return imageLink; // Assuming response.data has the URL
		} catch (error) {
			console.error("Error uploading file", error);
			throw error;
		}
	};

	const updateImage = async (uri) => {
		try {
			const image = await handleImageUpload(uri); // Wait for image upload to complete
			// console.log("image:", image);
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				profile_picture_url: image,
			}));
			setChanged(true);
			// console.log("\n\nUpdated profile data:", profileData);
		} catch (error) {
			console.error("Error updating image:", error);
		}
	};

	const toggleGenreSelector = () => {
		if (isGenreDialogVisible) {
			setIsGenreDialogVisible(false);
		} else {
			setIsGenreDialogVisible(true);
		}
	};

	const dialogs = {
		name: setNameDialogVisible,
		username: setUsernameDialogVisible,
		bio: setBioDialogVisible,
		photo: setPhotoDialogVisible,
		link: setLinkAddDialogVisible,
	};

	const [changedFields, setChangedFields] = useState({});
	const [changed, setChanged] = useState(false);

	const handleSave = (text, value) => {
		// console.log("Saved:", text);
		if (dialogs[value]) {
			dialogs[value](false);
		} else {
			console.error(`No dialog setter found for value: ${value}`);
		}

		// Update the appropriate property in profileData
		if (value === "name") {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				profile_name: text,
			}));

			setChangedFields((prevChangedFields) => ({
				...prevChangedFields,
				profile_name: text,
			}));
			// console.log("Changed: " + JSON.stringify(changedFields));
			setChanged(true);
		} else if (value === "username") {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				username: text,
			}));

			setChangedFields((prevChangedFields) => ({
				...prevChangedFields,
				username: text,
			}));
			// console.log("Changed: " + JSON.stringify(changedFields));
			setChanged(true);
		} else if (value === "bio") {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				bio: text,
			}));
			setChanged(true);

			setChangedFields((prevChangedFields) => ({
				...prevChangedFields,
				bio: text,
			}));
			// console.log("Changed: " + JSON.stringify(changedFields));
			// } else if (value === "instagramLink") {
			// 	setProfileData((prevProfileData) => ({
			// 		...prevProfileData,
			// 		links: { data: text },
			// 	}));
			// 	setChanged(true);

			// 	setChangedFields((prevChangedFields) => ({
			// 		...prevChangedFields,
			// 		links: { data: text },
			// 	}));
			// 	console.log("Changed: " + JSON.stringify(changedFields));
		} else if (value === "genres") {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				fav_genres: text,
			}));
			setChanged(true);

			setChangedFields((prevChangedFields) => ({
				...prevChangedFields,
				fav_genres: text,
			}));
			// console.log("Changed: " + JSON.stringify(changedFields));
		} else if (value === "favoriteSongs") {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				fav_songs: text,
			}));
			setChanged(true);

			setChangedFields((prevChangedFields) => ({
				...prevChangedFields,
				fav_songs: text,
			}));
			// console.log("Changed: " + JSON.stringify(changedFields));
		}
	};

	const handleLinkAddition = (link) => {
		// setLinks((prevLinks) => [...prevLinks, link]);

		setProfileData((prevProfileData) => ({
			...prevProfileData,
			links: {
				...prevProfileData.links,
				data: [...prevProfileData.links.data, { links: link }],
			},
		}));
		setChanged(true);

		setLinkAddDialogVisible(false);
	};

	const handleLinkDeletion = (linkToDelete) => {
		if (profileData.links && Array.isArray(profileData.links.data)) {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				links: {
					...prevProfileData.links,
					data: prevProfileData.links.data.filter(
						(item) => item.links !== linkToDelete,
					),
				},
			}));
			// console.log(profileData.links);
			setChanged(true);
		}
	};

	const getGenres = async () => {
		try {
			const token = await auth.getToken();

			if (token) {
				const response = await axios.get(`${utils.API_BASE_URL}/genres`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				// console.log("Genre data" + response.data);
				setGenres(response.data);
			}
		} catch (error) {
			console.error("Error fetching genres:", error);
		}
	};

	useEffect(() => {
		getGenres();
		console.log("Genres: " + genres[0]);
	}, []);

	const [currentLinkIndex, setCurrentLinkIndex] = useState(null);
	const [currentLinkEditText, setCurrentLinkEditText] = useState("");

	const openEditDialog = (index, text) => {
		setCurrentLinkIndex(index);
		setCurrentLinkEditText(text);
		setLinkEditDialogVisible(true);
	};

	const handleLinkEdit = (index, newLink) => {
		if (profileData.links && Array.isArray(profileData.links.data)) {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				links: {
					...prevProfileData.links,
					data: prevProfileData.links.data.map((item, i) =>
						i === index ? { ...item, links: newLink } : item,
					),
				},
			}));
			// console.log(profileData.links);
			setLinkEditDialogVisible(false);
			setChanged(true);
		}
	};

	const removeGenre = (genreToRemove) => {
		if (profileData.fav_genres && Array.isArray(profileData.fav_genres.data)) {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				fav_genres: {
					...prevProfileData.fav_genres,
					data: prevProfileData.fav_genres.data.filter(
						(genre) => genre !== genreToRemove,
					),
				},
			}));
			setChanged(true);
		}
	};

	const addGenre = (genreToAdd) => {
		if (profileData.fav_genres && Array.isArray(profileData.fav_genres.data)) {
			// Check if the genre already exists
			if (!profileData.fav_genres.data.includes(genreToAdd)) {
				setProfileData((prevProfileData) => ({
					...prevProfileData,
					fav_genres: {
						...prevProfileData.fav_genres,
						data: [...prevProfileData.fav_genres.data, genreToAdd],
					},
				}));
				setChanged(true);
			}
		}
	};

	const removeSong = (index) => {
		setProfileData((prevProfileData) => {
			const updatedSongs = [...prevProfileData.fav_songs.data];
			updatedSongs.splice(index, 1);
			return {
				...prevProfileData,
				fav_songs: {
					...prevProfileData.fav_songs,
					data: updatedSongs,
				},
			};
		});
		setChanged(true);
		setChangedFields((prevChangedFields) => ({
			...prevChangedFields,
		}));
	};

	const addSong = (newSongs: any) => {
		setProfileData((prevProfileData: any) => {
			const updatedSongs = [...prevProfileData.fav_songs.data, ...newSongs];
			return {
				...prevProfileData,
				fav_songs: {
					...prevProfileData.fav_songs,
					data: updatedSongs,
				},
			};
		});
		setChanged(true);
		setChangedFields((prevChangedFields) => ({
			...prevChangedFields,
		}));

		console.log("Fav Songs: " + JSON.stringify(profileData.fav_songs));

		setIsSongDialogVisible(false);
	};

	const renderAddLink = () => {
		if (profileData.links.count < 3) {
			return (
				<View style={styles.listItem}>
					<TouchableOpacity
						onPress={() => setLinkAddDialogVisible(true)}
						style={styles.editButton}
					>
						<Text style={{ fontWeight: "600" }}>Add link</Text>
					</TouchableOpacity>
					<EditDialog
						value="link"
						title="Add Link"
						visible={isLinkAddDialogVisible}
						onClose={() => setLinkAddDialogVisible(false)}
						onSave={handleLinkAddition}
					/>
				</View>
			);
		}
	};

	return (
		<View style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.profileHeader}>
					<TouchableOpacity
						onPress={() => router.navigate("screens/profile/ProfilePage")}
					>
						<Text>Cancel</Text>
					</TouchableOpacity>
					<Text style={styles.title}>Edit Profile</Text>
					<TouchableOpacity
						onPress={() => {
							updateProfile(changed);
							setUserData(null);
							router.navigate("screens/profile/ProfilePage");
						}}
						style={styles.saveButton}
					>
						<Text style={styles.saveButtonText}>Save</Text>
					</TouchableOpacity>
				</View>
				{/* Fetch data */}
				<View style={styles.profilePictureContainer}>
					<Image
						source={profileData.profile_picture_url}
						style={{ width: 125, height: 125, borderRadius: 125 / 2 }}
					/>
					<TouchableOpacity
						onPress={() => setPhotoDialogVisible(true)}
						style={styles.changePhotoButton}
						testID="photo-button"
					>
						<Text>Change Photo</Text>
					</TouchableOpacity>
					<PhotoSelect
						isVisible={isPhotoDialogVisible}
						onClose={() => setPhotoDialogVisible(false)}
						onImageUpload={updateImage} // Pass the URI of the photo you want to display
					/>
				</View>
				{/* Name */}
				<View style={styles.listItem}>
					<Text style={styles.title}>Name</Text>
					<TouchableOpacity
						onPress={() => setNameDialogVisible(true)}
						style={styles.editButton}
						testID="name-button"
					>
						<Text style={{ marginLeft: 42 }}>{profileData.profile_name}</Text>
					</TouchableOpacity>
					<EditDialog
						initialText={profileData.profile_name}
						value="name"
						visible={isNameDialogVisible}
						onClose={() => setNameDialogVisible(false)}
						onSave={handleSave}
					/>
				</View>
				{/* Username */}
				<View style={styles.listItem}>
					<Text style={styles.title}>Username</Text>
					<TouchableOpacity
						onPress={() => setUsernameDialogVisible(true)}
						style={styles.editButton}
						testID="username-button"
					>
						<Text style={{ marginLeft: 15 }}>@{profileData.username}</Text>
					</TouchableOpacity>
					<EditDialog
						initialText={profileData.username}
						maxLines={1}
						value="username"
						visible={isUsernameDialogVisible}
						onClose={() => setUsernameDialogVisible(false)}
						onSave={handleSave}
					/>
				</View>
				{/* Bio */}
				<View style={styles.listItem}>
					<Text style={styles.title}>Bio</Text>
					<TouchableOpacity
						onPress={() => setBioDialogVisible(true)}
						style={styles.editButton}
						testID="bio-button"
					>
						<Text style={{ marginLeft: 60 }}>{profileData.bio}</Text>
					</TouchableOpacity>
					<EditDialog
						initialText={profileData.bio}
						value="bio"
						isBio={true}
						visible={isBioDialogVisible}
						onClose={() => setBioDialogVisible(false)}
						onSave={handleSave}
					/>
				</View>
				{/* Social */}
				<View style={styles.divider} />
				<View style={styles.listItem}>
					<Text style={styles.title}>Social</Text>
				</View>
				{profileData &&
					profileData.links &&
					profileData.links.data &&
					profileData.links.data.map((link, index) => (
						<View key={index} style={styles.listItem}>
							<TouchableOpacity
								onPress={() => openEditDialog(index, link.links)}
								style={styles.editButton}
								testID="link-edit-button"
							>
								<Text>{link.links}</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => handleLinkDeletion(link.links)}>
								<Ionicons
									name="close"
									size={16}
									color="black"
									style={styles.icon}
								/>
							</TouchableOpacity>
							<EditDialog
								initialText={currentLinkEditText}
								index={currentLinkIndex}
								maxLines={1}
								visible={isLinkEditDialogVisible}
								onClose={() => setLinkEditDialogVisible(false)}
								onSave={handleLinkEdit}
							/>
						</View>
					))}
				{renderAddLink()}
				{/* Genres */}
				<View style={styles.divider} />
				<View style={styles.listItem}>
					<Text style={styles.title}>Genres</Text>
				</View>
				<View style={styles.chipsContainer}>
					{profileData?.fav_genres?.data?.map((genre, index) => (
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
					<Selector
						options={genres}
						placeholder={"Search Genres"}
						visible={isGenreDialogVisible}
						onSelect={addGenre}
						onClose={toggleGenreSelector}
					/>
				</View>
				{/* Favorite Songs */}
				<View style={styles.divider} />
				<View style={styles.listItem}>
					<Text style={styles.title}>Favorite Songs</Text>
				</View>
				<ScrollView>
					{profileData?.fav_songs?.data?.map((song, index) => (
						<FavoriteSongs
							key={index}
							songTitle={song.title}
							artist={song.artists}
							duration={song.duration}
							albumArt={song.cover}
							toEdit={true}
							onPress={() => removeSong(index)}
						/>
					))}
				</ScrollView>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<TouchableOpacity
						onPress={() => setIsSongDialogVisible(true)}
						style={styles.container2}
					>
						<Text style={styles.text}>
							Add Song <Icons name="plus" size={14} color="black" />
						</Text>
					</TouchableOpacity>
				</View>
				<AddFavSong
					visible={isSongDialogVisible}
					handleSave={addSong}
				></AddFavSong>
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	text: {
		color: "black",
		fontWeight: "500",
		fontSize: 14,
	},
	icon: {
		marginLeft: 60,
	},
	container2: {
		marginRight: 12,
		marginBottom: 10,
		paddingHorizontal: 14,
		paddingVertical: 8,
		backgroundColor: "rgba(232, 235, 242, 1)",
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
	},

	title: {
		fontSize: 16,
		fontWeight: "700",
	},

	//stuff
	container: {
		flex: 1,
		padding: 20,
	},
	profileHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	saveButton: {
		padding: 10,
	},
	saveButtonText: {
		color: "grey",
	},
	profilePictureContainer: {
		alignItems: "center",
		marginTop: 20,
	},
	changePhotoButton: {
		marginTop: 10,
	},
	listItem: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	listItemTitle: {
		fontWeight: "bold",
	},
	subTitle: {
		fontWeight: "bold",
		color: "grey",
	},
	editButton: {
		paddingVertical: 5,
		width: 250,
	},
	divider: {
		borderBottomWidth: 1,
		borderBottomColor: "grey",
		marginVertical: 20,
	},
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 10,
	},
	chip: {
		padding: 10,
		borderRadius: 20,
		backgroundColor: "lightgrey",
		marginRight: 10,
		marginBottom: 10,
	},
	chipText: {
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
});

export default EditProfileScreen;
