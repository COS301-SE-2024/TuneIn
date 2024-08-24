import React, { useEffect, useState, useContext } from "react";
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
	RefreshControl,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import BioSection from "../../components/BioSection";
import GenreList from "../../components/GenreList";
import RoomCard from "../../components/rooms/RoomCard";
import FavoriteSongs from "../../components/FavoriteSong";
import LinkBottomSheet from "../../components/LinkBottomSheet";
import MusicBottomSheet from "../../components/MusicBottomSheet";
import NowPlaying from "../../components/NowPlaying";
import axios from "axios";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { Player } from "../../PlayerContext";
import { formatRoomData } from "../../models/Room";
import * as StorageService from "../../services/StorageService"; // Import StorageService

const ProfileScreen: React.FC = () => {
	const navigation = useNavigation();
	const router = useRouter();
	const params = useLocalSearchParams();
	const navigateToAnayltics = () => {
		router.navigate("/screens/analytics/AnalyticsPage");
	};

	const navigateToLogout = () => {
		router.navigate("/screens/WelcomScreen");
	};

	const navigateToHelp = () => {
		router.navigate("/screens/help/HelpScreen");
	};

	let ownsProfile: boolean = true;

	const BackgroundIMG: string =
		"https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600";
	const ProfileIMG: string =
		"https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg";

	// const [ownsProfile, setOwnsProfile] = useState<boolean>(true);
	const [isLinkDialogVisible, setLinkDialogVisible] = useState(false);
	const [isMusicDialogVisible, setMusicDialogVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [following, setFollowing] = useState<boolean>(false);
	const [friend, setFriend] = useState<any>(null);
	const [profileInfo, setProfileInfo] = useState<any>(null);
	const [refreshing] = React.useState(false);

	const [primaryProfileData, setPrimProfileData] = useState<any>(null);
	const [roomData, setRoomData] = useState<any>(null);
	const [drawerVisible, setDrawerVisible] = useState(false);

	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { userData, setUserData, currentRoom } = playerContext;

	const navigateToRoomPage = () => {
		router.push({
			pathname: "/screens/rooms/RoomPage",
			params: { room: JSON.stringify(roomData) },
		});
	};

	if (params && JSON.stringify(params) !== "{}") {
		// console.log("profile params: " + JSON.stringify(params));
		ownsProfile = false;
	}

	const preFormatRoomData = (room: any, mine: boolean) => {
		return {
			id: room.roomID,
			backgroundImage: room.room_image ? room.room_image : BackgroundIMG,
			name: room.room_name,
			language: room.language,
			songName: room.current_song ? room.current_song.title : null,
			artistName: room.current_song
				? room.current_song.artists.join(", ")
				: null,
			description: room.description,
			userID: room.creator.userID,
			userProfile: room.creator ? room.creator.profile_picture_url : ProfileIMG,
			username: room.creator ? room.creator.username : "Unknown",
			roomSize: 50,
			tags: room.tags ? room.tags : [],
			mine: mine,
			isNsfw: room.has_nsfw_content,
			isExplicit: room.has_explicit_content,
		};
	};

	const ownsRoom = async (roomID: string): Promise<boolean> => {
		const cachedMyRooms = await StorageService.getItem("cachedMyRooms");
		if (cachedMyRooms && cachedMyRooms.length > 0) {
			const jsonCache = JSON.parse(cachedMyRooms);
			// console.log("My Rooms: " + cachedMyRooms + " Room ID: " + room.roomID);
			for (let i = 0; i < jsonCache.length; i++) {
				if (jsonCache[i].id === roomID) {
					return true;
				}
			}
		}

		return false;
	};

	useEffect(() => {
		// console.log("init effect called");
		const initializeProfile = async () => {
			if (!ownsProfile) {
				const parsedFriend = JSON.parse(params.friend as string);
				setFriend(parsedFriend);

				try {
					const storedToken = await auth.getToken();
					if (storedToken) {
						const data = await fetchProfileInfo(
							storedToken,
							parsedFriend.username,
						);
						setPrimProfileData(data);
						// console.log("Fetched Data: " + JSON.stringify(data));

						if (userData !== null) {
							const isFollowing = data.followers.data.some(
								(item: any) => item.username === userData.username,
							);
							setFollowing(isFollowing);
						}
						if (roomData === null) {
							fetchRoomInfo(data.userID);
							// console.log("Friend room call");
						}
					}
				} catch (error) {
					console.error("Failed to retrieve profile data:", error);
				}
			} else {
				// console.log("Owner called with user data: " + JSON.stringify(userData));
				if (!userData) {
					try {
						const storedToken = await auth.getToken();
						// console.log("Stored token: " + storedToken);
						if (storedToken) {
							// console.log("Owner profile call");
							fetchProfileInfo(storedToken, "");
						}
					} catch (error) {
						console.error("Failed to retrieve profile data:", error);
					}
				} else {
					if (roomData === null) {
						setRoomData(currentRoom);
					}
				}
				setPrimProfileData(userData);
			}

			setLoading(false);
		};

		initializeProfile();
	}, [userData, setUserData]);

	useEffect(() => {
		if (ownsProfile && primaryProfileData) {
			// console.log("set Info called");
			setProfileInfo({
				profile_picture_url: primaryProfileData.profile_picture_url,
				profile_name: primaryProfileData.profile_name,
				username: primaryProfileData.username,
				bio: primaryProfileData.bio,
				links: primaryProfileData.links,
				fav_genres: primaryProfileData.fav_genres,
				fav_songs: primaryProfileData.fav_songs,
			});
		}
	}, [primaryProfileData, ownsProfile]);

	useEffect(() => {
		if (!ownsProfile && primaryProfileData) {
			const intervalId = setInterval(() => {
				fetchRoomInfo(primaryProfileData.userID);
			}, 10000);

			return () => clearInterval(intervalId);
		}
	}, [primaryProfileData, ownsProfile]);

	useEffect(() => {
		if (ownsProfile) {
			if (currentRoom) {
				console.log("Owner Room Effect Called");
				setRoomData(currentRoom);
				console.log("Updated Room Data:", currentRoom);
			} else {
				setRoomData(null);
			}
		}
	}, [currentRoom, ownsProfile]);

	const toggleDrawer = () => {
		setDrawerVisible(!drawerVisible);
	};

	const fetchProfileInfo = async (token: string, username: string) => {
		try {
			if (!userData) {
				// console.log("Fetching profile info");
				const response = await axios.get(`${utils.API_BASE_URL}/users`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setUserData(response.data);
				if (ownsProfile) {
					// console.log("Profile info: " + JSON.stringify(response.data));
					return response.data;
				}
			}
			// console.log("Fetching with data: " + JSON.stringify(friend));

			const response = await axios.get(
				`${utils.API_BASE_URL}/users/${username}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			// console.log("Profile info: " + JSON.stringify(response));
			return response.data;
		} catch (error) {
			console.error("Error fetching profile info:", error);
			return null;
		}
	};

	const fetchRoomInfo = async (userID: string) => {
		try {
			const storedToken = await auth.getToken();
			if (storedToken) {
				const response = await axios.get(
					`${utils.API_BASE_URL}/users/${userID}/room/current`,
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);
				// console.log("Room info: " + JSON.stringify(response.data.room));
				const hasRoom = await ownsRoom(response.data.room.roomID);
				const formattedRoomData = preFormatRoomData(
					response.data.room,
					hasRoom,
				);
				setRoomData(formatRoomData(formattedRoomData));
				// console.log("My Room? " + hasRoom);
			}
		} catch (error) {
			console.error("Error fetching room info:", error);
			return null;
		}
	};

	const followHandler = async () => {
		const storedToken = await auth.getToken();

		if (storedToken) {
			if (following) {
				const response = await axios.post(
					`${utils.API_BASE_URL}/users/${primaryProfileData.userID}/unfollow`,
					{},
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);

				if (response) {
					// console.log("Called Unfollow");
					primaryProfileData.followers.count--;
					setFollowing(false);
				} else {
					// console.error("Issue unfollowing user");
				}
			} else {
				const response = await axios.post(
					`${utils.API_BASE_URL}/users/${primaryProfileData.userID}/follow`,
					{},
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);

				if (response) {
					// console.log("Called Follow");
					primaryProfileData.followers.count++;
					setFollowing(true);
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
					roomId: primaryProfileData.current_room.roomId,
					action: primaryProfileData.current_room.joined ? "leave" : "join",
				},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			const updatedProfileData = {
				...primaryProfileData,
				current_room: response.data,
			};
			setPrimProfileData(updatedProfileData);
		} catch (error) {
			console.error("Error updating room join/leave:", error);
		}
	};

	const renderLinks = () => {
		if (primaryProfileData.links.count && primaryProfileData.links.count > 1) {
			const firstLink = primaryProfileData.links.data[0].links;
			const remainingCount = primaryProfileData.links.count - 1;

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
		} else if (primaryProfileData.links.count === 1) {
			return (
				<View>
					<Text
						style={{ fontWeight: "700", textAlign: "center", marginTop: 30 }}
					>
						{primaryProfileData.links.data[0].links}
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
								pathname: "screens/profile/EditProfilePage",
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
		if (primaryProfileData.fav_rooms.count > 0) {
			return (
				<View
					style={{ paddingHorizontal: 20, paddingTop: 10 }}
					testID="fav-rooms"
				>
					<Text style={styles.title}>Favorite Rooms</Text>
					<View style={styles.roomCardsContainer}>
						{primaryProfileData.fav_rooms.data.slice(0, 2).map((room) => (
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
		if (primaryProfileData.recent_rooms.count > 0) {
			// console.log("profileData:", profileData.recent_rooms.data.slice(0, 2));
			return (
				<View style={{ paddingHorizontal: 20 }} testID="recent-rooms">
					<Text style={styles.title}>Recently Visited</Text>
					<View style={styles.roomCardsContainer}>
						{primaryProfileData.recent_rooms.data.slice(0, 2).map((room) => (
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

	const onRefresh = React.useCallback(async () => {
		setLoading(true);
		const storedToken = await auth.getToken();

		if (storedToken) {
			setUserData(null);
			fetchProfileInfo(storedToken, "");
		}

		setTimeout(() => {
			setLoading(false);
		}, 2000);
	}, []);

	if (
		loading ||
		ownsProfile === null ||
		userData === null ||
		primaryProfileData === null
	) {
		console.log(
			"loading: " +
				loading +
				" userData: " +
				userData +
				" primaryProfile: " +
				primaryProfileData +
				" roomData: " +
				roomData,
		);
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
		<ScrollView
			showsVerticalScrollIndicator={false}
			refreshControl={
				<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
			}
		>
			<View style={{ padding: 15 }} testID="profile-screen">
				<View style={styles.profileHeader}>
					{/* Back Button */}
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						testID="back-button"
					>
						<Ionicons name="chevron-back" size={30} color="black" />
					</TouchableOpacity>
					{/* Settings Icon */}
					{ownsProfile && (
						<TouchableOpacity onPress={toggleDrawer}>
							<Ionicons name="settings-outline" size={24} color="black" />
						</TouchableOpacity>
					)}
				</View>
				{ownsProfile && (
					<View style={styles.container}>
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
				)}
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
						source={{ uri: primaryProfileData.profile_picture_url }}
						style={{ width: 125, height: 125, borderRadius: 125 / 2 }}
					/>
				</View>
				<Text style={{ fontSize: 20, fontWeight: "600", textAlign: "center" }}>
					{primaryProfileData.profile_name}
				</Text>
				<Text style={{ fontWeight: "400", textAlign: "center" }}>
					@{primaryProfileData.username}
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
							{primaryProfileData.followers.count}
						</Text>
						<Text style={{ fontSize: 15, fontWeight: "400" }}>Followers</Text>
					</View>
					<View style={{ marginLeft: 60, alignItems: "center" }}>
						<Text style={{ fontSize: 20, fontWeight: "600" }}>
							{primaryProfileData.following.count}
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
					links={primaryProfileData.links.data}
				/>
				{renderFollowOrEdit()}
				{roomData !== null && (
					<TouchableOpacity
						onPress={navigateToRoomPage}
						style={{ paddingHorizontal: 20 }}
					>
						<NowPlaying
							name={roomData.name}
							creator={roomData.username}
							art={roomData.backgroundImage}
						/>
					</TouchableOpacity>
				)}
				{primaryProfileData.bio !== "" && (
					<View style={{ paddingHorizontal: 20 }} testID="bio">
						<BioSection content={primaryProfileData.bio} />
					</View>
				)}
				{primaryProfileData.fav_genres.count > 0 && (
					<View style={{ paddingHorizontal: 20 }} testID="genres">
						<GenreList items={primaryProfileData.fav_genres.data} />
					</View>
				)}
				<View style={{ paddingHorizontal: 20 }} testID="fav-songs">
					<Text style={styles.title}>Favorite Songs</Text>
					{primaryProfileData.fav_songs.data.slice(0, 2).map((song) => (
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
				{primaryProfileData.current_room ? (
					<View style={{ alignItems: "center", marginTop: 20 }}>
						<TouchableOpacity style={styles.button} onPress={handleJoinLeave}>
							<Text style={styles.buttonText}>
								{primaryProfileData.current_room.joined
									? "Leave Room"
									: "Join Room"}
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
	profileHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
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
		paddingHorizontal: 20,
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
