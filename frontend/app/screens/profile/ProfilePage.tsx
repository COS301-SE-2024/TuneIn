import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	ActivityIndicator,
	Modal,
	TouchableWithoutFeedback,
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
import { Ionicons } from "@expo/vector-icons";
import profileIcon from "../../assets/profile-icon.png";

const ProfileScreen: React.FC = () => {
	const router = useRouter();
	let params = useLocalSearchParams();
	let ownsProfile = true;
	let friend = "";

	const navigateToAnayltics = () => {
		router.navigate("/screens/analytics/AnalyticsPage");
	};

	const navigateToLogout = () => {
		router.navigate("/screens/WelcomScreen");
	};

	const navigateToHelp = () => {
		router.navigate("/screens/help/HelpScreen");
	};

	// console.log("Params: " + JSON.stringify(params));

	if (JSON.stringify(params) !== "{}") {
		friend = JSON.parse(params.friend as string);
		ownsProfile = false;
	}

	const [isLinkDialogVisible, setLinkDialogVisible] = useState(false);
	const [isMusicDialogVisible, setMusicDialogVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [following, setFollowing] = useState<boolean>(false);
	const [imageLoaded, setImageLoaded] = useState(false);
	const [profileData, setProfileData] = useState<any>(null);

	const [drawerVisible, setDrawerVisible] = useState(false);

	const toggleDrawer = () => {
		setDrawerVisible(!drawerVisible);
	};

	useEffect(() => {
		const getTokenAndData = async () => {
			try {
				const storedToken = await auth.getToken();

				if (storedToken) {
					const data = await fetchProfileInfo(storedToken);
					// console.log(data);
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
				<TouchableOpacity
					style={styles.button}
					onPress={() => followHandler()}
					testID="follow-button"
				>
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
			<TouchableOpacity
				onPress={() => router.back()}
				style={styles.backButton}
				testID="backButton"
			>
				<Ionicons name="chevron-back" size={24} color="black" />
			</TouchableOpacity>
			<View style={{ padding: 15 }} testID="profile-screen">
				<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
					<View style={{ flex: 1 }} />
					{/* <TouchableOpacity>
            <Text style={[styles.buttonText, { paddingBottom: 20 }]}>
              Settings
            </Text>
          </TouchableOpacity> */}
				</View>
				<View style={styles.container}>
					{/* Settings Icon */}
					<TouchableOpacity onPress={toggleDrawer}>
						<Ionicons name="settings-outline" size={24} color="black" />
					</TouchableOpacity>

					{/* Drawer Modal */}
					<Modal
						transparent={true}
						visible={drawerVisible}
						animationType="slide"
						onRequestClose={() => setDrawerVisible(false)}
					>
						{/* Overlay */}
						<TouchableWithoutFeedback onPress={() => setDrawerVisible(false)}>
							<View style={styles.overlay} />
						</TouchableWithoutFeedback>

						{/* Drawer Content */}
						<View style={styles.drawer}>
							{/* Close Drawer Button */}
							<View style={styles.closeButtonContainer}>
								<TouchableOpacity onPress={toggleDrawer}>
									<Ionicons name="close" size={24} color="black" />
								</TouchableOpacity>
							</View>

							{/* Drawer Items */}
							<Text style={styles.drawerItem} onPress={navigateToAnayltics}>
								Analytics
							</Text>
							<Text style={styles.drawerItem} onPress={navigateToHelp}>
								Help Menu
							</Text>
							<Text style={styles.drawerItem} onPress={navigateToLogout}>
								Logout
							</Text>
						</View>
					</Modal>
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
					{!imageLoaded ||
					profileInfo?.profile_picture_url ===
						"https://example.com/default-profile-picture.png" ? (
						<Image
							source={require("../../assets/profile-icon.png")}
							style={styles.profileImage}
						/>
					) : (
						<Image
							source={{ uri: profileInfo.profile_picture_url }}
							style={[
								styles.profileImage,
								,
								!imageLoaded && { display: "none" },
							]}
							onLoad={() => setImageLoaded(true)}
							defaultSource={require("../../assets/profile-icon.png")} // Note: `defaultSource` is not supported in the latest versions of React Native.
						/>
					)}
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
	profileImage: { width: 125, height: 125 },
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

	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "flex-end", // Aligns the icon to the right
		padding: 20,
	},

	// Modal overlay to capture clicks outside the drawer
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},

	// Drawer style
	drawer: {
		width: "60%", // Adjust this to control the drawer width
		height: "100%",
		backgroundColor: "white",
		position: "absolute",
		right: 0, // Makes the drawer appear from the left side
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 5, height: 0 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
		elevation: 5,
	},

	// Close button container aligned to the right
	closeButtonContainer: {
		alignItems: "flex-end",
	},

	// Drawer items style
	drawerItem: {
		fontSize: 18,
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
	},
});

export default ProfileScreen;
