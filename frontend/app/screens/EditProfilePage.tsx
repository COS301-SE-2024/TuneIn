import React, { useState } from "react";
import {
	View,
	Text,
	Image,
	TextInput,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import EditGenreBubble from "../components/EditGenreBubble";
import EditDialog from "../components/EditDialog";
import SongDialog from "../components/SongDialog";
import PhotoSelect from "../components/PhotoSelect";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icons from "react-native-vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";
import { rgbaColor } from "react-native-reanimated/lib/typescript/reanimated2/Colors";

const EditProfileScreen = () => {
	const [name, setName] = useState("John Doe");
	const [username, setUsername] = useState("john");
	const [bio, setBio] = useState(
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
	);
	const [instagramLink, setInstagramLink] = useState("");
	const [twitterLink, setTwitterLink] = useState("");
	const [genres, setGenres] = useState([
		"Pop",
		"Hip-Hop",
		"Jazz",
		"Classical",
		"Rock",
	]);
	const [favoriteSongs, setFavoriteSongs] = useState([]);

	const [isBioDialogVisible, setBioDialogVisible] = useState(false);
	const [isNameDialogVisible, setNameDialogVisible] = useState(false);
	const [isUsernameDialogVisible, setUsernameDialogVisible] = useState(false);
	const [isPhotoDialogVisible, setPhotoDialogVisible] = useState(false);

	const dialogs = {
		name: setNameDialogVisible,
		username: setUsernameDialogVisible,
		bio: setBioDialogVisible,
		photo: setPhotoDialogVisible,
	};

	const setters = {
		name: setName,
		username: setUsername,
		bio: setBio,
		instagramLink: setInstagramLink,
		twitterLink: setTwitterLink,
		genres: setGenres,
		favoriteSongs: setFavoriteSongs,
	};

	const handleSave = (text, value) => {
		console.log("Saved:", text);
		if (dialogs[value]) {
			dialogs[value](false);
		} else {
			console.error(`No dialog setter found for value: ${value}`);
		}

		// Call the appropriate setter function
		if (setters[value]) {
			setters[value](text);
		} else {
			console.error(`No setter function found for value: ${value}`);
		}
	};

	const removeGenre = (genreToRemove) => {
		setGenres(genres.filter((genre) => genre !== genreToRemove));
	};

	// Function to handle saving profile
	const saveProfile = () => {
		// Logic to save profile data
	};

	// Function to show edit dialog
	const showEditDialog = (field, controller, maxLines = 1) => {
		// Logic to show edit dialog
	};

	const mockImage = require("../Assets/MockProfilePic.jpeg");

	return (
		<View style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.profileHeader}>
					<TouchableOpacity onPress={() => navigation.navigate("ProfilePage")}>
						<Text>Cancel</Text>
					</TouchableOpacity>
					<Text style={styles.title}>Edit Profile</Text>
					<TouchableOpacity onPress={() => {}} style={styles.saveButton}>
						<Text style={styles.saveButtonText}>Save</Text>
					</TouchableOpacity>
				</View>
				{/* Fetch data */}
				<View style={styles.profilePictureContainer}>
					<Image
						source={mockImage}
						style={{ width: 125, height: 125, borderRadius: 125 / 2 }}
					/>
					<TouchableOpacity
						onPress={() => setPhotoDialogVisible(true)}
						style={styles.changePhotoButton}
					>
						<Text>Change Photo</Text>
					</TouchableOpacity>
					<PhotoSelect
						visible={isPhotoDialogVisible}
						onClose={() => setPhotoDialogVisible(false)}
						onSave={handleSave}
						photoUri={mockImage} // Pass the URI of the photo you want to display
					/>
				</View>
				{/* Name */}
				<View style={styles.listItem}>
					<Text style={styles.title}>Name</Text>
					<TouchableOpacity
						onPress={() => setNameDialogVisible(true)}
						style={styles.editButton}
					>
						<Text style={{ marginLeft: 42 }}>{name}</Text>
					</TouchableOpacity>
					<EditDialog
						initialText={name}
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
					>
						<Text style={{ marginLeft: 15 }}>@{username}</Text>
					</TouchableOpacity>
					<EditDialog
						initialText={username}
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
					>
						<Text style={{ marginLeft: 60 }}>{bio}</Text>
					</TouchableOpacity>
					<EditDialog
						initialText={bio}
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
				<View style={styles.listItem}>
					<Text style={styles.subTitle}>instagram.com/john</Text>
					<TouchableOpacity
						onPress={() => showEditDialog("Instagram Link", setInstagramLink)}
						style={styles.editButton}
					>
						<Text>{instagramLink}</Text>
					</TouchableOpacity>
				</View>
				{/* <View style={styles.listItem}>
          <Text style={styles.subTitle}>Twitter</Text>
          <TouchableOpacity onPress={() => showEditDialog('Twitter Link', setTwitterLink)} style={styles.editButton}>
            <Text>{twitterLink}</Text>
          </TouchableOpacity>
        </View> */}
				{/* Genres */}
				<View style={styles.divider} />
				<View style={styles.listItem}>
					<Text style={styles.title}>Genres</Text>
				</View>
				<View style={styles.chipsContainer}>
					{genres.map((genre, index) => (
						<EditGenreBubble
							key={index}
							text={genre}
							onPress={() => removeGenre(genre)}
						/>
					))}
					{/* Render add genre button */}
					<TouchableOpacity onPress={() => {}} style={styles.addGenreButton}>
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
				</View>
				{/* Favorite Songs */}
				<View style={styles.divider} />
				<View style={styles.listItem}>
					<Text style={styles.title}>Favorite Songs</Text>
				</View>
				<View style={styles.container1}>
					<View style={styles.playingContainer}>
						<View style={styles.albumArt}></View>
						<View style={styles.detailsContainer}>
							<Text style={styles.songTitle}>Don't Smile At Me</Text>
							<Text style={styles.artist}>Billie Eilish</Text>
						</View>
						<Text style={styles.duration}>5:33</Text>
						<MaterialIcons
							name="more-horiz"
							size={24}
							color="black"
							style={styles.moreIcon}
						/>
					</View>
				</View>
				<View style={styles.container1}>
					<View style={styles.playingContainer}>
						<View style={styles.albumArt}></View>
						<View style={styles.detailsContainer}>
							<Text style={styles.songTitle}>Don't Smile At Me</Text>
							<Text style={styles.artist}>Billie Eilish</Text>
						</View>
						<Text style={styles.duration}>5:33</Text>
						<MaterialIcons
							name="more-horiz"
							size={24}
							color="black"
							style={styles.moreIcon}
						/>
					</View>
				</View>
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<View style={styles.container2}>
						<Text style={styles.text}>
							Add Song <Icons name="plus" size={14} color="black" />
						</Text>
					</View>
				</View>
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

	//favourite songs
	container1: {
		marginBottom: 20,
	},
	title: {
		fontSize: 16,
		fontWeight: "700",
		paddingBottom: 10,
	},
	playingContainer: {
		width: 310,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 0,
		marginTop: 10, // Adjusted marginTop for space
		paddingVertical: 10, // Added paddingVertical for space
	},
	albumArt: {
		width: 57,
		height: 57,
		borderRadius: 12,
		backgroundColor: "rgba(158, 171, 184, 1)",
		marginRight: 16,
	},
	detailsContainer: {
		paddingRight: 40,
	},
	songTitle: {
		fontSize: 16,
		fontWeight: "600",
	},
	artist: {
		fontSize: 12,
		fontWeight: "400",
		marginTop: 5,
	},
	duration: {
		marginLeft: 10,
	},
	moreIcon: {
		marginLeft: 30,
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
		marginTop: 20,
	},
	listItemTitle: {
		fontWeight: "bold",
	},
	subTitle: {
		fontWeight: "bold",
		color: "grey",
	},
	editButton: {
		padding: 5,
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
