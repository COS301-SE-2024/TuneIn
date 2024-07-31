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
import { useRouter, useLocalSearchParams } from "expo-router";
import BioSection from "../../components/BioSection";
import GenreList from "../../components/GenreList";
import RoomCard from "../../components/rooms/RoomCard";
import FavoriteSongs from "../../components/FavoriteSong";
import LinkBottomSheet from "../../components/LinkBottomSheet";
import MusicBottomSheet from "../../components/MusicBottomSheet";
import axios from "axios";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";

const ProfileScreen: React.FC = () => {
	const router = useRouter();
	let params = useLocalSearchParams();
	let ownsProfile = true;
	let friend = "";

	// console.log("Params: " + JSON.stringify(params));

	if (JSON.stringify(params) !== "{}") {
		friend = JSON.parse(params.friend as string);
		ownsProfile = false;
	}

	const [isLinkDialogVisible, setLinkDialogVisible] = useState(false);
	const [isMusicDialogVisible, setMusicDialogVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [following, setFollowing] = useState<boolean>(false);

	const [profileData, setProfileData] = useState<any>(null);

	useEffect(() => {
		const getTokenAndData = async () => {
			try {
				const storedToken = await auth.getToken();

				if (storedToken) {
					const data = await fetchProfileInfo(storedToken);
					if (!ownsProfile) {
						const isFollowing = data.followers.data.some(
							(item: any) => item.username === params.user,
						);
						// console.log(isFollowing);
						setFollowing(isFollowing);
						// console.log(isFollowing);
					}

					setProfileData(data);
					setLoading(false);
				}
			} catch (error) {
				console.error("Failed to retrieve token:", error);
			}
		};

		getTokenAndData();
	});

	const fetchProfileInfo = async (token: string) => {
		try {
			if (ownsProfile) {
				const response = await axios.get(`${utils.API_BASE_URL}/users`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				return response.data;
			}

			const response = await axios.get(
				`${utils.API_BASE_URL}/users/${friend.username}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			return response.data;
		} catch (error) {
			console.error("Error fetching profile info:", error);
			return null;
		}
	};

	const followHandler = async () => {
		const storedToken = await auth.getToken();

		if (storedToken) {
			if (following) {
				const response = await axios.post(
					`${utils.API_BASE_URL}/users/${profileData.userID}/unfollow`,
					{},
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
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
					`${utils.API_BASE_URL}/users/${profileData.userID}/follow`,
					{},
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
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
		}
	};

	const handleJoinLeave = async () => {
		try {
			const token = await auth.getToken();
			const response = await axios.post(
				`${utils.API_BASE_URL}/joinLeaveRoom`,
				{
					roomId: profileData.current_room.roomId,
					action: profileData.current_room.joined ? "leave" : "join",
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const updatedProfileData = {
				...profileData,
				current_room: response.data,
			};
			setProfileData(updatedProfileData);
		} catch (error) {
			console.error("Error updating room join/leave:", error);
		}
	};

	const renderLinks = () => {
		if (profileData.links.count && profileData.links.count > 1) {
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

	const renderFollowOrEdit = () => {
		if (ownsProfile) {
			return (
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
			);
		}

		return (
			<View style={{ alignItems: "center", marginTop: 20, paddingBottom: 20 }}>
				<TouchableOpacity style={styles.button} onPress={() => followHandler()}>
					<Text style={styles.buttonText}>
						{following ? "Unfollow" : "Follow"}
					</Text>
				</TouchableOpacity>
			</View>
		);
	};

	const renderFavRooms = () => {
		if (profileData.fav_rooms.count > 0) {
			return (
				<View
					style={{ paddingHorizontal: 20, paddingTop: 10 }}
					testID="fav-rooms"
				>
					<Text style={styles.title}>Favorite Rooms</Text>
					<View style={styles.roomCardsContainer}>
						{profileData.fav_rooms.data.slice(0, 2).map((room) => (
							<RoomCard
								key={room.roomId}
								roomName={room.room_name}
								songName={room.current_song.title}
								artistName={room.current_song.artists}
								username={room.creator.username}
								imageUrl={room.room_image}
							/>
						))}
					</View>
				</View>
			);
		}
	};

	const renderRecentRooms = () => {
		if (profileData.recent_rooms.count > 0) {
			// console.log("profileData:", profileData.recent_rooms.data.slice(0, 2));
			return (
				<View style={{ paddingHorizontal: 20 }} testID="recent-rooms">
					<Text style={styles.title}>Recently Visited</Text>
					<View style={styles.roomCardsContainer}>
						{profileData.recent_rooms.data.slice(0, 2).map((room) => (
							<RoomCard
								key={room.roomId}
								roomName={room.room_name}
								songName={room.current_song.title}
								artistName={room.current_song.artists}
								username={room.creator.username}
								imageUrl={room.room_image}
							/>
						))}
					</View>
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
				<ActivityIndicator size={100} color="#0000ff" />
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
			<View style={{ padding: 15 }} testID="profile-screen">
				<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
					<View style={{ flex: 1 }} />
					{/* <TouchableOpacity>
            <Text style={[styles.buttonText, { paddingBottom: 20 }]}>
              Settings
            </Text>
          </TouchableOpacity> */}
				</View>
				<Text
					style={{
						fontWeight: "600",
						fontSize: 20,
						textAlign: "center",
						marginTop: 20,
					}}
				>
					Profile
				</Text>
				<View
					style={{ alignItems: "center", marginTop: 20 }}
					testID="profile-pic"
				>
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
					testID="links-touchable"
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
				{renderFollowOrEdit()}
				{/* <View style={{ paddingHorizontal: 20 }}>
          <NowPlaying
            title={favoriteSongsData[0].songTitle}
            artist={favoriteSongsData[0].artist}
            duration={favoriteSongsData[0].duration}
          />
        </View> */}
				<View style={{ paddingHorizontal: 20 }} testID="bio">
					<BioSection content={profileData.bio} />
				</View>
				<View style={{ paddingHorizontal: 20 }} testID="genres">
					<GenreList items={profileData.fav_genres.data} />
				</View>
				<View style={{ paddingHorizontal: 20 }} testID="fav-songs">
					<Text style={styles.title}>Favorite Songs</Text>
					{profileData.fav_songs.data.slice(0, 2).map((song) => (
						<FavoriteSongs
							key={song.id}
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
				{profileData.current_room ? (
					<View style={{ alignItems: "center", marginTop: 20 }}>
						<TouchableOpacity style={styles.button} onPress={handleJoinLeave}>
							<Text style={styles.buttonText}>
								{profileData.current_room.joined ? "Leave Room" : "Join Room"}
							</Text>
						</TouchableOpacity>
					</View>
				) : null}
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	roomCardsContainer: {
		flexDirection: "row",
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
