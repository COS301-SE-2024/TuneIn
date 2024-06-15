import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import NowPlaying from "../components/NowPlaying";
import BioSection from "../components/BioSection";
import GenreList from "../components/GenreList";
import RoomCard from "../components/RoomCard";
import FavoriteSongs from "../components/FavoriteSong";
import LinkBottomSheet from "../components/LinkBottomSheet";
import MusicBottomSheet from "../components/MusicBottomSheet";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen: React.FC = () => {
	const baseURL = "http://localhost:3000";
	const router = useRouter();
	const favoriteRooms = [
		{
			roomName: "Room 1",
			songName: "Song 1",
			artistName: "Artist 1",
			username: "user1",
		},
		{
			roomName: "Room 2",
			songName: "Song 2",
			artistName: "Artist 2",
			username: "user2",
		},
	];
	const recentRooms = [
		{
			roomName: "Room 4",
			songName: "Song 4",
			artistName: "Artist 4",
			username: "user4",
		},
		{
			roomName: "Room 5",
			songName: "Song 5",
			artistName: "Artist 5",
			username: "user5",
		},
	];
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
	]);
	const [isLinkDialogVisible, setLinkDialogVisible] = useState(false);
	const [isMusicDialogVisible, setMusicDialogVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(true);

	const [token, setToken] = useState<string | null>(null);

	const fetchProfileInfo = async (token: string | null) => {
		try {
			const response = await axios.get(`${baseURL}/profile`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			console.log(response);
			return response.data;
		} catch (error) {
			console.error("Error fetching profile info:", error);
			return [];
		}
	};

	const [profileData, setProfileData] = useState<any>(null);

	useEffect(() => {
		const getTokenAndData = async () => {
			try {
				const storedToken = await AsyncStorage.getItem("token");
				setToken(storedToken);

				if (storedToken) {
					const data = await fetchProfileInfo(storedToken);
					setProfileData(data);
					setLoading(false);
				}
			} catch (error) {
				console.error("Failed to retrieve token:", error);
			}
		};

		getTokenAndData();
	}, []);

	const renderLinks = () => {
		if (profileData.links.count > 1) {
			const firstLink = profileData.links.data[0].links;
			const remainingCount = profileData.links.count - 1;

			return (
				<View>
					<Text
						style={{ fontWeight: "700", textAlign: "center", marginTop: 30 }}
					>
						{firstLink} and {remainingCount} more link
						{remainingCount > 1 ? "s" : ""}
					</Text>
				</View>
			);
		} else if (profileData.links.count == 1) {
			return (
				<View>
					<Text
						style={{ fontWeight: "700", textAlign: "center", marginTop: 30 }}
					>
						{profileData.links.data[0].links}
					</Text>
				</View>
			);
		} else {
			return null; // No links to display
		}
	};

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	const profileInfo = {
		profile_picture_url: profileData.profile_picture_url,
		profile_name: profileData.profile_name,
		username: profileData.username,
		bio: profileData.bio,
		links: profileData.links,
		fav_genres: profileData.fav_genres,
		fav_songs: profileData.fav_songs,
	};

	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<View style={{ padding: 15 }}>
				<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
					<View style={{ flex: 1 }} />
					<TouchableOpacity>
						<Text style={[styles.buttonText, { paddingBottom: 20 }]}>
							Settings
						</Text>
					</TouchableOpacity>
				</View>
				<Text style={{ fontWeight: "600", fontSize: 20, textAlign: "center" }}>
					Profile
				</Text>
				<View style={{ alignItems: "center", marginTop: 20 }}>
					<Image
						source={{ uri: profileData.profile_picture_url }}
						style={{ width: 125, height: 125, borderRadius: 125 / 2 }}
					/>
				</View>
				<Text style={{ fontSize: 20, fontWeight: "600", textAlign: "center" }}>
					{profileData.profile_name}
				</Text>
				<Text style={{ fontWeight: "400", textAlign: "center" }}>
					@{profileData.username}
				</Text>
				<View
					style={{
						flexDirection: "row",
						justifyContent: "center",
						marginTop: 10,
					}}
				>
					<View style={{ alignItems: "center" }}>
						<Text style={{ fontSize: 20, fontWeight: "600" }}>
							{profileData.followers.count}
						</Text>
						<Text style={{ fontSize: 15, fontWeight: "400" }}>Followers</Text>
					</View>
					<View style={{ marginLeft: 60, alignItems: "center" }}>
						<Text style={{ fontSize: 20, fontWeight: "600" }}>
							{profileData.following.count}
						</Text>
						<Text style={{ fontSize: 15, fontWeight: "400" }}>Following</Text>
					</View>
				</View>
				<TouchableOpacity
					onPress={() => {
						setLinkDialogVisible(true);
					}}
				>
					{renderLinks()}
				</TouchableOpacity>
				<LinkBottomSheet
					isVisible={isLinkDialogVisible}
					onClose={() => {
						setLinkDialogVisible(false);
					}}
					links={profileData.links.data}
				/>
				<View
					style={{ alignItems: "center", marginTop: 20, paddingBottom: 20 }}
				>
					<TouchableOpacity
						style={styles.button}
						onPress={() =>
							router.push({
								pathname: "screens/EditProfilePage",
								params: { profile: JSON.stringify(profileInfo) },
							})
						}
					>
						<Text style={styles.buttonText}>Edit</Text>
					</TouchableOpacity>
				</View>
				<View style={{ paddingHorizontal: 20 }}>
					<NowPlaying
						title={favoriteSongsData[0].songTitle}
						artist={favoriteSongsData[0].artist}
						duration={favoriteSongsData[0].duration}
					/>
				</View>
				<View style={{ paddingHorizontal: 20 }}>
					<BioSection content={profileData.bio} />
				</View>
				<View style={{ paddingHorizontal: 20 }}>
					<GenreList items={profileData.fav_genres.data}></GenreList>
				</View>
				<View style={{ paddingHorizontal: 20 }}>
					<Text style={styles.title}>Favorite Songs</Text>
					{profileData.fav_songs.data.slice(0, 2).map((song, index) => (
						<FavoriteSongs
							key={index}
							songTitle={song.title}
							artist={song.artists}
							duration={song.duration}
							albumArt={song.cover}
							onPress={() => setMusicDialogVisible(true)}
						/>
					))}
					<MusicBottomSheet
						isVisible={isMusicDialogVisible}
						onClose={() => setMusicDialogVisible(false)}
					/>
				</View>
				<View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
					<Text style={styles.title}>Favorite Rooms</Text>
					<View style={styles.roomCardsContainer}>
						{profileData.fav_rooms.data.slice(0, 2).map((room) => (
							<RoomCard
								key={room.room_id}
								roomName={room.room_name}
								songName={room.current_song.title}
								artistName={room.current_song.artists}
								username={room.creator.username}
							/>
						))}
					</View>
				</View>
				<View style={{ paddingHorizontal: 20 }}>
					<Text style={styles.title}>Recently Visited</Text>
					<View style={styles.roomCardsContainer}>
						{profileData.recent_rooms.data.slice(0, 2).map((room) => (
							<RoomCard
								key={room.room_id}
								roomName={room.room_name}
								songName={room.current_song.title}
								artistName={room.current_song.artists}
								username={room.creator.username}
							/>
						))}
					</View>
				</View>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	roomCardsContainer: {
		flexDirection: "row",
		// justifyContent: 'space-between',
		marginBottom: 20,
	},

	title: {
		fontSize: 20,
		fontWeight: "600",
		paddingBottom: 10,
	},
	button: {
		width: 155,
		height: 37,
		backgroundColor: "rgba(158, 171, 184, 1)",
		borderRadius: 18.5,
		justifyContent: "center",
		alignItems: "center",
	},
	buttonText: {
		color: "black",
		fontWeight: "600",
	},
});

export default ProfileScreen;
