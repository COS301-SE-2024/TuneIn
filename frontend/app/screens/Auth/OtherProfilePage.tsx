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
import { useLocalSearchParams } from "expo-router";
import NowPlaying from "../../components/NowPlaying";
import BioSection from "../../components/BioSection";
import GenreList from "../../components/GenreList";
import RoomCard from "../../components/rooms/RoomCard";
import FavoriteSongs from "../../components/FavoriteSong";
import LinkBottomSheet from "../../components/LinkBottomSheet";
import MusicBottomSheet from "../../components/MusicBottomSheet";
import axios from "axios";
import auth from "../../services/AuthManagement"; // Import AuthManagement
import * as utils from "../../services/Utils"; // Import Utils
import { colors } from "../../styles/colors";
import { useLive } from "../../LiveContext";

const ProfileScreen: React.FC = () => {
	const params = useLocalSearchParams();
	const username = params.username;
	const { currentUser } = useLive();

	const [isLinkDialogVisible, setLinkDialogVisible] = useState(false);
	const [isMusicDialogVisible, setMusicDialogVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [setToken] = useState<string | null>(null);
	const [following, setFollowing] = useState<boolean>(false);

	const fetchProfileInfo = async (token: string) => {
		try {
			const response = await axios.get(
				`${utils.API_BASE_URL}/users/${username}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			console.log(response);
			return response.data;
		} catch (error) {
			console.error("Error fetching profile info:", error);
			return [];
		}
	};

	const [profileData, setProfileData] = useState<any>(null);
	const [setUserProfileData] = useState<any>(null);

	useEffect(() => {
		const getTokenAndData = async () => {
			try {
				const storedToken = await auth.getToken();

				if (storedToken) {
					const data = await fetchProfileInfo(storedToken);
					setProfileData(data);
					setUserProfileData(currentUser);

					const isFollowing = data.followers.data.some(
						(item) => item.userID === currentUser.userID,
					);
					console.log(isFollowing);
					setFollowing(isFollowing);

					setLoading(false);
				}
			} catch (error) {
				console.error("Failed to retrieve token:", error);
			}
		};

		getTokenAndData();
	});

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
		} else if (profileData.links.count === 1) {
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

	const renderFavRooms = () => {
		if (profileData.fav_rooms.count > 0) {
			return (
				<View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
					<Text style={styles.title}>Favorite Rooms</Text>
					<View style={styles.roomCardsContainer}>
						{profileData.fav_rooms.data.slice(0, 2).map((room) => (
							<RoomCard
								key={room.roomId}
								roomName={room.room_name}
								songName={room.current_song.title}
								artistName={room.current_song.artists}
								username={room.creator.username}
							/>
						))}
					</View>
				</View>
			);
		}
	};

	const renderRecentRooms = () => {
		if (profileData.recent_rooms.count > 0) {
			console.log("profileData:", profileData.recent_rooms.data.slice(0, 2));
			return (
				<View style={{ paddingHorizontal: 20 }}>
					<Text style={styles.title}>Recently Visited</Text>
					<View style={styles.roomCardsContainer}>
						{profileData.recent_rooms.data.slice(0, 2).map((room) => (
							<RoomCard
								key={room.roomId}
								roomName={room.room_name}
								songName={room.current_song.title}
								artistName={room.current_song.artists}
								username={room.creator.username}
							/>
						))}
					</View>
				</View>
			);
		}
	};

	if (loading) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	const followHandler = async () => {
		const t = await auth.getToken();
		if (following) {
			const response = await axios.post(
				`${utils.API_BASE_URL}/users/${profileData.username}/unfollow`,
				{},
				{
					headers: {
						Authorization: `Bearer ${t}`,
					},
				},
			);

			if (response) {
				setFollowing(false);
				profileData.followers.count--;
			} else {
				console.error("Issue unfollowing user");
			}
		} else {
			const response = await axios.post(
				`${utils.API_BASE_URL}/users/${profileData.username}/follow`,
				{},
				{
					headers: {
						Authorization: `Bearer ${t}`,
					},
				},
			);

			if (response) {
				setFollowing(true);
				profileData.followers.count++;
			} else {
				console.error("Issue unfollowing user");
			}
		}
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
						onPress={() => followHandler()}
					>
						<Text style={styles.buttonText}>
							{following ? "Unfollow" : "Follow"}
						</Text>
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
				{renderFavRooms()}
				{renderRecentRooms()}
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
