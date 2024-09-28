import React, { useContext, useEffect, useState, useRef } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
	TextInput,
	ActivityIndicator,
	ToastAndroid,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import EditGenreBubble from "../../components/EditGenreBubble";
import FavoriteSongs from "../../components/FavoriteSong";
import PhotoSelect from "../../components/PhotoSelect";
import Icons from "react-native-vector-icons/FontAwesome";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import uploadImage from "../../services/ImageUpload";
import auth from "../../services/AuthManagement"; // Import AuthManagement
import * as utils from "../../services/Utils"; // Import Utils
import AddFavSong from "../../components/AddFavSong";
import { Player } from "../../PlayerContext";
import { colors } from "../../styles/colors";
import GenreAdder from "../../components/GenreAdder";

type InputRef = TextInput | null;

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

	const inputRefs = useRef<InputRef[]>([]);
	const { userData, setUserData } = playerContext;

	const [profileData, setProfileData] = useState(profileInfo);
	const [genres, setGenres] = useState<string[]>([
		"rock",
		"pop",
		"jazz",
		"classical",
		"hip hop",
		"country",
		"electronica",
		"reggae",
		"blues",
		"folk",
		"metal",
		"punk",
		"soul",
		"r&b",
		"funk",
		"dancehall",
		"techno",
		"ambient",
		"gospel",
		"latin",
		"reggaeton",
		"ska",
		"opera",
	]);
	let [flatLinks, setFlatLinks] = useState<string[]>(
		Object.values(profileData.links.data).flat() as unknown as string[],
	);
	const [isPhotoDialogVisible, setPhotoDialogVisible] = useState(false);
	const [isGenreDialogVisible, setIsGenreDialogVisible] = useState(false);
	const [isSongDialogVisible, setIsSongDialogVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(false);
	const [usrNmErrorMessage, setUsrNmErrorMessage] = useState<string>("");
	const [nmErrorMessage, setNmErrorMessage] = useState<string>("");
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

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

	const handleUpdate = async () => {
		setLoading(true);
		const response = await updateProfile();
		console.log("The response: " + JSON.stringify(response));
		if (JSON.stringify(response) !== "[]") {
			setUserData(null);
		} else {
			setLoading(false);
		}
	};

	useEffect(() => {
		const checkData = async () => {
			if (JSON.stringify(profileInfo) !== JSON.stringify(profileData)) {
				let validNames: boolean = true;
				if (profileInfo.username !== profileData.username) {
					const validUsername: boolean = await checkUsername();
					validNames = validUsername;
				}

				if (
					profileInfo.profile_name !== profileData.profile_name &&
					profileData.profile_name === ""
				) {
					setNmErrorMessage("Name cannot be empty");
					validNames = false;
				} else {
					setNmErrorMessage("");
				}

				setChanged(validNames);
			} else {
				setUsrNmErrorMessage("");
				setChanged(false);
			}
		};

		checkData();
	}, [profileData]);

	const updateProfile = async () => {
		try {
			// console.log("Profile data: " + JSON.stringify(profileData));
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
			console.log("Error updating profile info:", error);
			ToastAndroid.show("Failed to update profile info", ToastAndroid.SHORT);
			return [];
		}
	};

	const checkUsername = async (): Promise<boolean> => {
		if (profileData.username === "") {
			setUsrNmErrorMessage("Username cannot be empty");
			return false;
		}

		const regex = /^[a-z0-9]+$/;
		if (!regex.test(profileData.username)) {
			setUsrNmErrorMessage(
				"Usernames must contain only lowercase letters and numbers, with no spaces or special characters",
			);
			return false;
		} else {
			setUsrNmErrorMessage("");
		}

		try {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Wait for the timeout to complete and handle the response
			const response = await new Promise<boolean>((resolve) => {
				timeoutRef.current = setTimeout(async () => {
					try {
						const response = await axios.get(
							`${utils.API_BASE_URL}/users/${profileData.username}/taken`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
								},
							},
						);

						if (response.data) {
							setUsrNmErrorMessage("Username already taken");
							resolve(false);
						} else {
							resolve(true);
						}
					} catch (error) {
						console.log("Error checking username:", error);
						setUsrNmErrorMessage("Error checking username");
						resolve(false);
					}
				}, 500);
			});

			return response;
		} catch (error) {
			console.log("Error in checkUsername:", error);
			return false;
		}
	};

	useEffect(() => {
		if (userData === null) {
			router.navigate("screens/profile/ProfilePage");
		}
	}, [userData]);

	const handleImageUpload = async (uri: string) => {
		try {
			const t = await auth.getToken();
			setToken(t);

			const imageLink = await uploadImage(uri, "image");
			return imageLink;
		} catch (error) {
			console.error("Error uploading file", error);
			throw error;
		}
	};

	const updateImage = async (uri: string) => {
		try {
			const image = await handleImageUpload(uri); // Wait for image upload to complete
			// console.log("image:", image);
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				profile_picture_url: image,
			}));

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

	const createTimeString = (seconds: number) => {
		// Calculate minutes and seconds
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		// Format the result as "minutes:seconds"
		const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
		return timeString;
	};

	const [changed, setChanged] = useState(false);

	const handleSave = (text, value) => {
		// Update the appropriate property in profileData
		if (value === "name") {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				profile_name: text,
			}));
		} else if (value === "username") {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				username: text,
			}));
		} else if (value === "bio") {
			setProfileData((prevProfileData) => ({
				...prevProfileData,
				bio: text,
			}));
		}
	};

	type ExternalLinks = Record<string, string[]>;

	function categorizeLinks(links: string[]): ExternalLinks {
		// Define regex patterns for popular social and music platforms
		const platformPatterns = {
			instagram: /instagram\.com/i,
			tiktok: /tiktok\.com/i,
			twitter: /twitter\.com/i,
			facebook: /facebook\.com/i,
			youtube: /youtube\.com/i,
			linkedin: /linkedin\.com/i,
			spotify: /spotify\.com/i,
			soundcloud: /soundcloud\.com/i,
			appleMusic: /music\.apple\.com/i,
			deezer: /deezer\.com/i,
			// Add more patterns as needed
		};

		// Initialize the external links object with an "other" category
		const categorizedLinks: { [key: string]: string[] } = {};

		// Iterate through each link and categorize it
		links.forEach((link) => {
			let categorized = false;

			for (const [platform, pattern] of Object.entries(platformPatterns)) {
				if (pattern.test(link)) {
					if (!categorizedLinks[platform]) {
						categorizedLinks[platform] = []; // Initialize array if not already present
					}
					categorizedLinks[platform].push(link);
					categorized = true;
					break; // Stop after finding the first match
				}
			}

			// If no platform matches, categorize as "other"
			if (!categorized) {
				if (!categorizedLinks["other"]) {
					categorizedLinks["other"] = [];
				}
				categorizedLinks.other.push(link);
			}
		});

		// Remove any keys that have empty arrays
		Object.keys(categorizedLinks).forEach((key) => {
			if (categorizedLinks[key].length === 0) {
				delete categorizedLinks[key];
			}
		});

		return categorizedLinks as ExternalLinks;
	}

	const updateLinks = (links: string[]) => {
		if (links.length !== 0) {
			const categorizedLinks = categorizeLinks(links);

			setProfileData((prevProfileData: any) => ({
				...prevProfileData,
				links: {
					data: categorizedLinks,
					count: links.length,
				},
			}));
		} else {
			setProfileData((prevProfileData: any) => ({
				...prevProfileData,
				links: {
					data: {},
					count: 0,
				},
			}));
		}
	};

	const handleLinkAddition = (link: string) => {
		setFlatLinks((prevLinks) => {
			const updatedLinks = [...prevLinks, link];
			updateLinks(updatedLinks); // Pass the updated links to updateLinks
			return updatedLinks;
		});

		setTimeout(() => {
			const lastIndex = inputRefs.current.length - 1;
			if (inputRefs.current[lastIndex]) {
				inputRefs.current[lastIndex]?.focus();
			}
		}, 0);
	};

	const handleLinkDeletion = (linkToDelete: string) => {
		setFlatLinks((prevLinks) => {
			const updatedLinks = prevLinks.filter((link) => link !== linkToDelete);
			updateLinks(updatedLinks); // Pass the updated links to updateLinks
			return updatedLinks;
		});
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
			console.log("Error fetching genres:", error);
		}
	};

	useEffect(() => {
		getGenres();
	}, []);

	const handleLinkEdit = (index: number, newLink: string) => {
		setFlatLinks((prevLinks) => {
			const updatedLinks = prevLinks.map((link, i) =>
				i === index ? newLink : link,
			);
			updateLinks(updatedLinks); // Pass the updated links to updateLinks
			return updatedLinks;
		});
	};

	const removeGenre = (genreToRemove: string) => {
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
		}
	};

	const addGenres = (genresToAdd: string[]) => {
		if (profileData.fav_genres && Array.isArray(profileData.fav_genres.data)) {
			genresToAdd.forEach((genre) => {
				if (!profileData.fav_genres.data.includes(genre)) {
					setProfileData((prevProfileData) => ({
						...prevProfileData,
						fav_genres: {
							...prevProfileData.fav_genres,
							data: [...prevProfileData.fav_genres.data, genre],
						},
					}));
				}
			});
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

		// console.log("Fav Songs: " + JSON.stringify(profileData.fav_songs));

		setIsSongDialogVisible(false);
	};

	const renderAddLink = () => {
		if (flatLinks.length < 5) {
			return (
				<View style={styles.listItem}>
					<TouchableOpacity
						onPress={() => handleLinkAddition("")}
						style={styles.editButton}
						testID="add-link"
					>
						<Text style={{ fontWeight: "600" }}>Add link</Text>
					</TouchableOpacity>
				</View>
			);
		}
	};

	if (loading) {
		return (
			<View
				style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
				testID="loading-indicator"
			>
				<ActivityIndicator size={100} color={colors.primary} />
			</View>
		);
	}

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
							if (changed) {
								// console.log("Update called");
								handleUpdate();
							}
						}}
						style={styles.saveButton}
						testID="save-button"
					>
						<Text
							style={
								changed ? styles.activeSaveButtonText : styles.saveButtonText
							}
						>
							Save
						</Text>
					</TouchableOpacity>
				</View>
				{/* Fetch data */}
				<View style={styles.profilePictureContainer}>
					<Image
						source={
							profileData.profile_picture_url
								? { uri: profileData.profile_picture_url }
								: require("../../../assets/profile-icon.png")
						}
						style={{
							width: 125,
							height: 125,
							borderRadius: 125 / 2,
						}}
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
					<TextInput
						style={{
							marginLeft: 42,
							borderBottomColor: "#000",
							borderBottomWidth: 1,
						}}
						value={profileData.profile_name}
						placeholder="Enter name here"
						onChangeText={(newName: string) => {
							handleSave(newName, "name");
						}}
					/>
				</View>
				{nmErrorMessage !== "" && (
					<Text style={[styles.errorMessage]}>{nmErrorMessage}</Text>
				)}
				{/* Username */}
				<View style={styles.listItem}>
					<Text style={styles.title}>Username</Text>
					<TextInput
						style={{
							marginLeft: 11,
							borderBottomColor: "#000",
							borderBottomWidth: 1,
						}}
						value={`${profileData.username}`}
						placeholder="Enter username here"
						onChangeText={(newName: string) => {
							handleSave(newName, "username");
						}}
					/>
				</View>
				{usrNmErrorMessage !== "" && (
					<Text style={[styles.errorMessage]}>{usrNmErrorMessage}</Text>
				)}
				{/* Bio */}
				<View style={styles.listItem}>
					<Text style={styles.title}>Bio</Text>
					<TextInput
						style={{
							marginLeft: 60,
							borderBottomColor: "#000",
							borderBottomWidth: 1,
						}}
						value={profileData.bio}
						placeholder="Enter bio here"
						onChangeText={(newName: string) => {
							handleSave(newName, "bio");
						}}
					/>
				</View>
				{/* Social */}
				<View style={styles.divider} />
				<View style={styles.listItem}>
					<Text style={styles.title}>Social</Text>
				</View>
				{profileData &&
					profileData.links &&
					flatLinks.map((link, index) => (
						<View key={index} style={styles.listItem}>
							<TextInput
								ref={(ref) => (inputRefs.current[index] = ref)}
								style={styles.editButton}
								value={link}
								onChangeText={(newLink) => {
									handleLinkEdit(index, newLink);
								}}
								onBlur={async () => {
									if (link === "") {
										handleLinkDeletion(link);
									}
								}}
							/>

							<TouchableOpacity
								onPress={() => handleLinkDeletion(link)}
								testID={`${link}-close`}
							>
								<Ionicons
									name="close"
									size={16}
									color="black"
									style={styles.icon}
								/>
							</TouchableOpacity>
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
							artist={song.artists.join(", ")}
							duration={song.duration ? createTimeString(song.duration) : null}
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
						testID="add-song"
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
		marginTop: 5,
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
		backgroundColor: colors.backgroundColor,
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
	activeSaveButtonText: {
		color: "black",
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
	errorMessage: {
		marginTop: 10,
		// marginLeft: 85,
		color: "red",
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
