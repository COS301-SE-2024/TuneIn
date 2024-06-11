import React, { useState } from "react";
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import EditGenreBubble from "../components/EditGenreBubble";
import EditDialog from "../components/EditDialog";
import FavoriteSongs from "../components/FavoriteSong";
import PhotoSelect from "../components/PhotoSelect";
import Icons from "react-native-vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";

const EditProfileScreen = () => {
	const router = useRouter();
	const [name, setName] = useState("John Doe");
	const [username, setUsername] = useState("john");
	const [bio, setBio] = useState(
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do",
	);
	const [instagramLink, setInstagramLink] = useState("instagram.com/john");
	const [twitterLink, setTwitterLink] = useState("twitter.com/john");
	const [links, setLinks] = useState([
		"instagram.com/john",
		"twitter.com/john",
	]);
	const [genres, setGenres] = useState([
		"Pop",
		"Hip-Hop",
		"Jazz",
		"Classical",
		"Rock",
	]);
	const [favoriteSongsData, setFavoriteSongsData] = useState([
		{
			songTitle: "Don't Smile At Me",
			artist: "Billie Eilish",
			duration: "5:33",
			albumArt: "https://example.com/path-to-album-art1.jpg",
		},
		{
			songTitle: "Blinding Lights",
			artist: "The Weekend",
			duration: "3:20",
			albumArt: "https://example.com/path-to-album-art2.jpg",
		},
		{
			songTitle: "Shape of You",
			artist: "Ed Sheeran",
			duration: "4:24",
			albumArt: "https://example.com/path-to-album-art3.jpg",
		},
		// Add more songs as needed
	]);
	const [favoriteSongs, setFavoriteSongs] = useState([]);

	const [isBioDialogVisible, setBioDialogVisible] = useState(false);
	const [isNameDialogVisible, setNameDialogVisible] = useState(false);
	const [isUsernameDialogVisible, setUsernameDialogVisible] = useState(false);
	const [isPhotoDialogVisible, setPhotoDialogVisible] = useState(false);
	const [isLinkDialogVisible, setLinkDialogVisible] = useState(false);

	const handleImageUpload = (uri) => {
		setProfilePic(uri);
		setPhotoDialogVisible(false); // Close the ImageUploadDialog after image upload
	};

	const dialogs = {
		name: setNameDialogVisible,
		username: setUsernameDialogVisible,
		bio: setBioDialogVisible,
		photo: setPhotoDialogVisible,
		link: setLinkDialogVisible,
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

	const handleLinkAddition = (link) => {
		setLinks(prevLinks => [...prevLinks, link]);
		setLinkDialogVisible(false);
	};

	const removeGenre = (genreToRemove) => {
		setGenres(genres.filter((genre) => genre !== genreToRemove));
	};

	const removeSong = (index) => {
		setFavoriteSongsData((prevSongs) => {
			const updatedSongs = [...prevSongs];
			updatedSongs.splice(index, 1);
			return updatedSongs;
		});
	};

	const [profilePic, setProfilePic] = useState(
		require("../assets/MockProfilePic.jpeg"),
	);

	return (
		<View style={styles.container}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.profileHeader}>
					<TouchableOpacity
						onPress={() => router.navigate("screens/ProfilePage")}
					>
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
						source={profilePic}
						style={{ width: 125, height: 125, borderRadius: 125 / 2 }}
					/>
					<TouchableOpacity
						onPress={() => setPhotoDialogVisible(true)}
						style={styles.changePhotoButton}
					>
						<Text>Change Photo</Text>
					</TouchableOpacity>
					<PhotoSelect
						isVisible={isPhotoDialogVisible}
						onClose={() => setPhotoDialogVisible(false)}
						onImageUpload={handleImageUpload} // Pass the URI of the photo you want to display
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
				{links.map((link, index) => (
					<View key={index} style={styles.listItem}>
						<TouchableOpacity onPress={() => {}} style={styles.editButton}>
							<Text>{link}</Text>
						</TouchableOpacity>
					</View>
				))}
				<View style={styles.listItem}>
					<TouchableOpacity
						onPress={() => setLinkDialogVisible(true)}
						style={styles.editButton}
					>
						<Text style={{ fontWeight: 600 }}>Add link</Text>
					</TouchableOpacity>
					<EditDialog
						value="link"
						title="Add Link"
						visible={isLinkDialogVisible}
						onClose={() => setLinkDialogVisible(false)}
						onSave={handleLinkAddition}
					/>
				</View>
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
				<ScrollView>
					{favoriteSongsData.map((song, index) => (
						<FavoriteSongs
							key={index}
							songTitle={song.songTitle}
							artist={song.artist}
							duration={song.duration}
							albumArt={song.albumArt}
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

	title: {
		fontSize: 16,
		fontWeight: "700",
		paddingBottom: 10,
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
