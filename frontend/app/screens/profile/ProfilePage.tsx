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
	ToastAndroid,
	Platform,
	Alert,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import BioSection from "../../components/BioSection";
import GenreList from "../../components/GenreList";
import FavoriteSongs from "../../components/FavoriteSong";
import LinkBottomSheet from "../../components/LinkBottomSheet";
import NowPlaying from "../../components/NowPlaying";
import axios, { AxiosError } from "axios";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../styles/colors";
import { Player } from "../../PlayerContext";
import { Room, formatRoomData } from "../../models/Room";
import * as StorageService from "../../services/StorageService"; // Import StorageService
import RoomCardWidget from "../../components/rooms/RoomCardWidget";
import AppCarousel from "../../components/AppCarousel";
import { RoomDto } from "../../models/RoomDto";
import { Friend } from "../../models/friend";
import FollowBottomSheet from "../../components/FollowBottomSheet";
import { User } from "../../models/user";
import ContextMenu from "../../components/profile/DrawerContextMenu";

const ProfileScreen: React.FC = () => {
	const navigation = useNavigation();
	const router = useRouter();
	const params = useLocalSearchParams();
	const navigateToAnayltics = () => {
		router.navigate("/screens/analytics/AnalyticsPage");
	};

	const navigateToLogout = () => {
		auth.logout();
	};

	const navigateToHelp = () => {
		router.navigate("/screens/(tabs)/HelpScreenelpScreen");
	};

	const navigateToFollowerStack = () => {
		router.push("/screens/followers/FollowerStack");
	};

	let ownsProfile: boolean = true;

	// const [ownsProfile, setOwnsProfile] = useState<boolean>(true);
	const [isLinkDialogVisible, setLinkDialogVisible] = useState(false);
	const [isFriendDialogVisible, setFriendDialogVisible] = useState(false);
	const [loading, setLoading] = useState<boolean>(true);
	const [following, setFollowing] = useState<boolean>(false);
	const [roomCheck, setRoomCheck] = useState<boolean>(false);
	const [profileInfo, setProfileInfo] = useState<any>(null);
	const [refreshing] = React.useState(false);
	const [primaryProfileData, setPrimProfileData] = useState<any>(null);
	const [currentRoomData, setCurrentRoomData] = useState<any>(null);
	const [recentRoomData, setRecentRoomData] = useState<any>(null);
	const [favoriteRoomData, setFavoriteRoomData] = useState<any>(null);
	const [drawerVisible, setDrawerVisible] = useState(false);
	const [friends, setFriends] = useState<Friend[]>([]);
	const [potentialFriends, setPotentialFriends] = useState<Friend[]>([]);
	const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
	const [requests, setRequests] = useState<Friend[]>([]);
	const [areFriends, setAreFriends] = useState<boolean>(false);
	const [arePotentialFriends, setArePotentialFriends] =
		useState<boolean>(false);
	const [isPendingRequest, setIsPendingRequest] = useState<boolean>(false);
	const [hasRequested, setHasRequested] = useState<boolean>(false);
	const [profileError, setProfileError] = useState<boolean>(false);
	const [favRoomError, setFavRoomError] = useState<boolean>(false);
	const [recentRoomError, setRecentRoomError] = useState<boolean>(false);
	const [friendError, setFriendError] = useState<boolean>(false);

	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { userData, setUserData, currentRoom } = playerContext;

	const navigateToRoomPage = () => {
		router.push({
			pathname: "/screens/rooms/RoomStack",
			params: { room: JSON.stringify(currentRoomData) },
		});
	};

	const navigateToMore = (type: string, items: any, title: string) => {
		router.push({
			pathname: "./MorePage",
			params: { type: type, items: JSON.stringify(items), title: title },
		});
	};

	const navigateToMoreRooms = (rooms: Room[], Name: string) => {
		router.navigate({
			pathname: "/screens/rooms/MoreRooms",
			params: { rooms: JSON.stringify(rooms), name: Name },
		});
	};

	if (params && JSON.stringify(params) !== "{}") {
		ownsProfile = false;
	}

	const preFormatRoomData = (room: any, mine: boolean) => {
		// console.log("Preparing room data: " + JSON.stringify(room));
		return {
			id: room.roomID,
			backgroundImage: room.room_image
				? room.room_image
				: require("../../../assets/imageholder.jpg"),
			name: room.room_name,
			language: room.language,
			songName: room.current_song ? room.current_song.title : null,
			artistName: room.current_song
				? room.current_song.artists.join(", ")
				: null,
			description: room.description,
			userID: room.creator.userID,
			userProfile: room.creator
				? room.creator.profile_picture_url
				: require("../../../assets/profile-icon.png"),
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
				try {
					const storedToken = await auth.getToken();
					if (storedToken) {
						const data = await fetchProfileInfo(
							storedToken,
							parsedFriend.username,
						);

						setPrimProfileData(data);

						const fData = await getFriends(storedToken);
						const potFData = await getPotentialFriends(storedToken);
						const penFData = await getPendingRequests(storedToken);
						const reqFData = await getFriendRequests(storedToken);

						setFriends(fData);
						setPotentialFriends(potFData);
						setPendingRequests(penFData);
						setRequests(reqFData);

						if (recentRoomData === null) {
							fetchRecentRoomInfo(data.username);
						}
						if (favoriteRoomData === null) {
							fetchFavRoomInfo(data.username);
						}

						if (userData !== null && data.followers.count > 0) {
							const isFollowing = data.followers.data.some(
								(item: any) => item.username === userData.username,
							);
							setFollowing(isFollowing);
						}

						const friends = fData.some(
							(f) => f.username === parsedFriend.username,
						);

						setAreFriends(friends);

						const potential = potFData.some(
							(pot) => pot.username === parsedFriend.username,
						);

						console.log("Potential: " + potential);

						setArePotentialFriends(potential);

						const pending = penFData.some(
							(pen) => pen.username === parsedFriend.username,
						);

						setIsPendingRequest(pending);

						const req = reqFData.some(
							(req) => req.username === parsedFriend.username,
						);

						setHasRequested(req);

						if (currentRoomData === null) {
							fetchCurrentRoomInfo(data.userID);
						}
					}
				} catch (error) {
					console.log("Failed to retrieve profile data:", error);
					setProfileError(true);
				}
			} else {
				if (!userData) {
					try {
						const storedToken = await auth.getToken();
						if (storedToken) {
							const data = await fetchProfileInfo(storedToken, "");
							// setPrimProfileData(data);
						}
					} catch (error) {
						console.log("Failed to retrieve profile data:", error);
						setProfileError(true);
					}
				} else {
					setPrimProfileData(userData);
				}

				if (
					recentRoomData === null &&
					userData !== null &&
					userData !== undefined
				) {
					// console.log("User Data for rec room: " + JSON.stringify(userData));
					fetchRecentRoomInfo(userData.username);
				}
				if (
					favoriteRoomData === null &&
					userData !== null &&
					userData !== undefined
				) {
					// console.log("fav Id: " + JSON.stringify(userData.userID));
					fetchFavRoomInfo(userData.username);
				}

				if (currentRoomData === null) {
					setCurrentRoomData(currentRoom);
					setRoomCheck(true);
				}
			}

			// console.log("Completed effect: " + JSON.stringify(userData));
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
				fetchCurrentRoomInfo(primaryProfileData.userID);
			}, 10000);

			return () => clearInterval(intervalId);
		}
	}, [primaryProfileData, ownsProfile]);

	useEffect(() => {
		if (ownsProfile) {
			if (currentRoom) {
				setCurrentRoomData(currentRoom);
			} else {
				setCurrentRoomData(null);
			}
		}
	}, [currentRoom, ownsProfile]);

	const toggleDrawer = () => {
		setDrawerVisible(!drawerVisible);
	};

	const fetchProfileInfo = async (token: string, username: string) => {
		console.log("Fetching profile info");
		try {
			if (!userData) {
				const response = await axios.get(`${utils.API_BASE_URL}/users`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				// console.log("Fetching profile info data: " + JSON.stringify(response));
				setUserData(response.data);
				if (ownsProfile) {
					// console.log("Profile return: " + JSON.stringify(response.data.fav_genres));
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
			setProfileError(false);
			return response.data;
		} catch (error) {
			console.log("Error fetching profile info:", error);
			setProfileError(true);
			return null;
		}
	};

	const fetchCurrentRoomInfo = async (userID: string) => {
		console.log("fetch current room");
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
				const hasRoom = await ownsRoom(response.data.roomID);
				const formattedRoomData = preFormatRoomData(response.data, hasRoom);
				setCurrentRoomData(formatRoomData(formattedRoomData));
				setRoomCheck(true);
			}
		} catch (error) {
			// console.log("Error: " + error);
			if (axios.isAxiosError(error)) {
				if (error.response && error.response.status === 404) {
					setCurrentRoomData(null);
					setRoomCheck(true);
				} else {
					console.log("Error fetching current room info:", error);
				}
			} else {
				console.log("An unknown error occurred:", error);
			}
		}
	};

	const getFriends = async (token: string): Promise<Friend[]> => {
		console.log("Getting friends");
		const _token = await auth.getToken();
		try {
			const response = await axios.get(`${utils.API_BASE_URL}/users/friends`, {
				headers: { Authorization: `Bearer ${_token}` },
			});
			const mappedFriends: Friend[] = response.data.map((friend: any) => ({
				profile_picture_url: friend.profile_picture_url,
				friend_id: friend.userID,
				username: friend.username,
				relationship: friend.relationship,
			}));
			setFriendError(false);
			// console.log("Friends: " + JSON.stringify(mappedFriends));

			return mappedFriends;
		} catch (error) {
			console.log("Error fetching friends:", error);
			setFriendError(true);
			return [];
		}
	};
	const getPotentialFriends = async (token: string): Promise<Friend[]> => {
		console.log("get potential friends");
		try {
			const response = await axios.get<Friend[]>(
				`${utils.API_BASE_URL}/users/friends/potential`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const mappedPotentialFriends: Friend[] = response.data.map(
				(friend: any) => ({
					profile_picture_url: friend.profile_picture_url,
					friend_id: friend.userID,
					username: friend.username,
					relationship: "mutual",
				}),
			);
			setFriendError(false);
			console.log(
				"Potential friends: " + JSON.stringify(mappedPotentialFriends),
			);

			return mappedPotentialFriends;
		} catch (error) {
			console.log("Error fetching potential friends:", error);
			setFriendError(true);
			return [];
		}
	};
	const getPendingRequests = async (token: string): Promise<Friend[]> => {
		console.log("get pending requests");
		try {
			const response = await axios.get<Friend[]>(
				`${utils.API_BASE_URL}/users/friends/pending`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const mappedPendingRequests: Friend[] = response.data.map(
				(request: any) => ({
					profile_picture_url: request.profile_picture_url,
					friend_id: request.userID,
					username: request.username,
					relationship: "pending",
				}),
			);
			setFriendError(false);
			console.log("Pending requests:", JSON.stringify(mappedPendingRequests));

			return mappedPendingRequests;
		} catch (error) {
			console.log("Error fetching pending requests:", error);
			setFriendError(true);
			return [];
		}
	};
	const getFriendRequests = async (token: string): Promise<Friend[]> => {
		console.log("Getting friend requests");
		try {
			const response = await axios.get<Friend[]>(
				`${utils.API_BASE_URL}/users/friends/requests`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			const mappedRequests: Friend[] = response.data.map((request: any) => ({
				profile_picture_url: request.profile_picture_url,
				friend_id: request.userID,
				username: request.username,
			}));
			setFriendError(false);
			console.log("Friend requests: " + JSON.stringify(mappedRequests));

			return mappedRequests;
		} catch (error) {
			console.log("Error fetching friend requests:", error);
			setFriendError(true);
			return [];
		}
	};

	const handleSendRequest = async (friend: {
		username: string;
		friend_id: string;
	}): Promise<void> => {
		const token = await auth.getToken();
		if (token) {
			try {
				const response = await fetch(
					`${utils.API_BASE_URL}/users/${friend.username}/befriend`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				console.log("Friend request response: " + JSON.stringify(response));
				if (response.status === 201) {
					console.log("Friend request sent successfully.");
					const updatedPotentialFriends = potentialFriends.filter(
						(_friend) => _friend.friend_id !== friend.friend_id,
					);
					setPotentialFriends(updatedPotentialFriends);
					setIsPendingRequest(true);
					setPendingRequests([...pendingRequests, friend]);
				} else if (response.status === 201) {
					ToastAndroid.show(
						"Cannot send request to user who does not follow you.",
						ToastAndroid.SHORT,
					);
				}
			} catch (error) {
				console.log("Error sending request:", error);
				ToastAndroid.show("Failed to send friend request.", ToastAndroid.SHORT);
			}
		}
	};

	const handleCancelRequest = async (friend: {
		username: string;
		friend_id: string;
	}): Promise<void> => {
		const token = await auth.getToken();
		if (token) {
			try {
				const response = await fetch(
					`${utils.API_BASE_URL}/users/${friend.username}/cancel`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				if (response.status === 201) {
					const updatedRequests = pendingRequests.filter(
						(request) => request.friend_id !== friend.friend_id,
					);
					setPendingRequests(updatedRequests);
					setIsPendingRequest(false);
					setPotentialFriends([...potentialFriends, friend]);
					console.log("Friend request cancelled successfully.");
				}
			} catch (error) {
				console.log("Error cancelling request:", error);
				ToastAndroid.show(
					"Failed to cancel friend request.",
					ToastAndroid.SHORT,
				);
			}
		}
	};

	const handleFriendRequest = async (
		friend: { username: string; friend_id: string },
		accept: boolean,
	): Promise<void> => {
		const token = await auth.getToken();
		if (token) {
			try {
				const response = await fetch(
					`${utils.API_BASE_URL}/users/${friend.username}/${accept ? "accept" : "reject"}`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				if (response.status === 201) {
					const updatedRequests = requests.filter(
						(request) => request.friend_id !== friend.friend_id,
					);
					setRequests(updatedRequests);
					if (accept) {
						setFriends([...friends, friend]);
						setAreFriends(true);
					} else {
						setPotentialFriends([...potentialFriends, friend]);
					}
					setArePotentialFriends(false);
					console.log("Friend request handled successfully.");
				}
			} catch (error) {
				console.log("Error handling request:", error);
				ToastAndroid.show(
					"Unable to handle friend request.",
					ToastAndroid.SHORT,
				);
			}
		}
	};

	const handleFriend = async (friend: {
		username: string;
		friend_id: string;
	}): Promise<void> => {
		const token = await auth.getToken();
		if (token) {
			try {
				const response = await fetch(
					`${utils.API_BASE_URL}/users/${friend.username}/unfriend`,
					{
						method: "POST",
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);
				if (response.status === 201) {
					const updatedFriends = friends.filter(
						(_friend) => _friend.friend_id !== friend.friend_id,
					);
					setFriends(updatedFriends);
					setAreFriends(false);
					setPotentialFriends([...potentialFriends, friend]);
					console.log("User unfriended successfully.");
				}
			} catch (error) {
				console.log("Error unfriending:", error);
				ToastAndroid.show("Failed to unfriend.", ToastAndroid.SHORT);
			}
		}
	};

	const fetchRecentRoomInfo = async (username: string) => {
		console.log("fetching recent room info");
		try {
			const storedToken = await auth.getToken();
			if (storedToken) {
				const recentResponse = await axios.get(
					`${utils.API_BASE_URL}/users/${username}/rooms/recent`,
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);

				const recentRoomsPromises = recentResponse.data.map(
					async (room: any) => {
						const hasRoom = await ownsRoom(room.roomID);
						const pre = preFormatRoomData(room, hasRoom);
						return formatRoomData(pre);
					},
				);

				const recentRooms = await Promise.all(recentRoomsPromises);

				setRecentRoomData(recentRooms);
				setRecentRoomError(false);
			}
		} catch (error) {
			console.log("Error fetching recent room info:", error);
			setRecentRoomError(true);
			return null;
		}
	};

	const fetchFavRoomInfo = async (username: string) => {
		console.log("fetching fav room info");
		try {
			const storedToken = await auth.getToken();
			if (storedToken) {
				const favResponse = await axios.get(
					`${utils.API_BASE_URL}/users/${username}/bookmarks`,
					{
						headers: {
							Authorization: `Bearer ${storedToken}`,
						},
					},
				);

				const favRoomsPromises = favResponse.data.map(async (room: any) => {
					const hasRoom = await ownsRoom(room.roomID);
					const pre = preFormatRoomData(room, hasRoom);
					return formatRoomData(pre);
				});

				const favRooms = await Promise.all(favRoomsPromises);

				setFavoriteRoomData(favRooms);
				setFavRoomError(false);
			}
		} catch (error) {
			console.log("Error fetching fav room info:", error);
			setFavRoomError(true);
			return null;
		}
	};

	const followHandler = async () => {
		const storedToken = await auth.getToken();

		if (storedToken) {
			try {
				const response = await axios.post(
					`${utils.API_BASE_URL}/users/${primaryProfileData.username}/unfollow`,
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
				}
			} catch (error) {
				console.log("Issue unfollowing user:", error);
				ToastAndroid.show("Failed to unfollow user", ToastAndroid.SHORT);
			}
			if (following) {
			} else {
				try {
					const response = await axios.post(
						`${utils.API_BASE_URL}/users/${primaryProfileData.username}/follow`,
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
					}
				} catch (error) {
					console.log("Issue following user:", error);
					ToastAndroid.show("Failed to follow user", ToastAndroid.SHORT);
				}
			}
		}
	};

	const renderLinks = () => {
		if (primaryProfileData.links.count && primaryProfileData.links.count > 1) {
			const firstKey = Object.keys(primaryProfileData.links.data)[0];
			const firstLinkArray = primaryProfileData.links.data[firstKey];
			const firstLink = firstLinkArray ? firstLinkArray[0] : null;

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
			const firstKey = Object.keys(primaryProfileData.links.data)[0];
			const firstLinkArray = primaryProfileData.links.data[firstKey];
			const firstLink = firstLinkArray ? firstLinkArray[0] : null;
			return (
				<View>
					<Text
						style={{ fontWeight: "700", textAlign: "center", marginTop: 30 }}
					>
						{firstLink}
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
				<>
					<TouchableOpacity
						style={[
							styles.button,
							{
								flex: 1,
								flexDirection: "row",
								paddingVertical: 5,
								alignItems: "center",
							},
						]}
						onPress={() => {
							if (following) {
								setFriendDialogVisible(true);
							} else {
								followHandler();
							}
						}}
						testID="follow-button"
					>
						<Text style={styles.buttonText}>
							{following ? "Following  " : "Follow"}
						</Text>
						{following && (
							<Ionicons
								style={{ paddingTop: 2 }}
								name="chevron-down"
								size={15}
								color="black"
							/>
						)}
					</TouchableOpacity>
					<FollowBottomSheet
						friend={{
							username: primaryProfileData.username,
							friend_id: primaryProfileData.userID,
						}}
						showFollowOptions={isFriendDialogVisible}
						isFriend={areFriends}
						isPotential={arePotentialFriends}
						isRequesting={hasRequested}
						isPending={isPendingRequest}
						handleUnfollow={followHandler}
						handleRequest={handleFriendRequest}
						handleUnfriend={handleFriend}
						handleCancel={handleCancelRequest}
						sendRequest={handleSendRequest}
						setShowMoreOptions={setFriendDialogVisible}
					></FollowBottomSheet>
				</>
			</View>
		);
	};

	const createTimeString = (seconds: number) => {
		// Calculate minutes and seconds
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		// Format the result as "minutes:seconds"
		const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
		return timeString;
	};

	const renderItem = ({ item }: { item: Room }) => {
		// console.log("Render item: " + JSON.stringify(favoriteRoomData));
		return <RoomCardWidget roomCard={item} />;
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

	// Function to show error messages
	const showError = (message: string) => {
		if (Platform.OS === "android") {
			ToastAndroid.show(message, ToastAndroid.SHORT);
		} else {
			Alert.alert("Error", message);
		}
	};

	// Function to handle different error cases
	const handleErrors = () => {
		console.log("Called");
		if (favRoomError || recentRoomError) {
			showError(
				favRoomError && recentRoomError
					? "Failed to load rooms"
					: favRoomError
						? "Failed to load favorite rooms"
						: "Failed to load recent rooms",
			);
		}

		if (currentRoom) {
			showError("Failed to load current room");
		}
	};

	const loadChecker = () => {
		return (
			loading ||
			ownsProfile === null ||
			userData === null ||
			primaryProfileData === null ||
			!roomCheck ||
			recentRoomData === null ||
			favoriteRoomData === null
		);
	};

	useEffect(() => {
		if (!loadChecker() && !profileError) {
			handleErrors();
		}
	}, [
		loading,
		ownsProfile,
		userData,
		primaryProfileData,
		roomCheck,
		recentRoomData,
		favoriteRoomData,
	]);

	if (loadChecker()) {
		// console.log(
		// 	"loading: " +
		// 		loading +
		// 		" userData: " +
		// 		userData +
		// 		" primaryProfile: " +
		// 		primaryProfileData +
		// 		" roomData: " +
		// 		roomData +
		// 		" roomCheck: " +
		// 		roomCheck,
		// );
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
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					testID="refresh-control"
				/>
			}
		>
			<View
				style={{
					paddingVertical: 15,
					paddingRight: 15,
					paddingLeft: 1,
					backgroundColor: "white",
				}}
				testID="profile-screen"
			>
				<View style={[styles.profileHeader, { paddingLeft: 15 }]}>
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
				{!profileError ? (
					<>
						{ownsProfile && (
							<View style={styles.container}>
								{/* Drawer Modal */}
								<ContextMenu isVisible={drawerVisible} onClose={toggleDrawer} />
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
								source={
									primaryProfileData.profile_picture_url
										? { uri: primaryProfileData.profile_picture_url }
										: require("../../../assets/profile-icon.png")
								}
								style={{
									width: 125,
									height: 125,
									borderRadius: 125 / 2,
									borderWidth: 1,
									borderColor: "black",
								}}
							/>
						</View>
						<Text
							style={{ fontSize: 20, fontWeight: "600", textAlign: "center" }}
						>
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
							<TouchableOpacity
								style={{ alignItems: "center" }}
								onPress={() => {
									const following: User = primaryProfileData.following.data.map(
										(item: any) => ({
											id: item.userID,
											profile_picture_url: item.profile_picture_url,
											profile_name: item.profile_name,
											username: item.username,
											followers: item.followers.data,
										}),
									);
									navigateToMore("user", following, "Following");
								}}
								testID="following-count"
							>
								<Text style={{ fontSize: 20, fontWeight: "600" }}>
									{primaryProfileData.following.count}
								</Text>
								<Text style={{ fontSize: 15, fontWeight: "400" }}>
									Following
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={{ marginLeft: 60, alignItems: "center" }}
								onPress={() => {
									const followers: User = primaryProfileData.followers.data.map(
										(item: any) => ({
											id: item.userID,
											profile_picture_url: item.profile_picture_url,
											profile_name: item.profile_name,
											username: item.username,
											followers: item.followers.data,
										}),
									);
									navigateToMore("user", followers, "Followers");
								}}
							>
								<Text style={{ fontSize: 20, fontWeight: "600" }}>
									{primaryProfileData.followers.count}
								</Text>
								<Text style={{ fontSize: 15, fontWeight: "400" }}>
									Followers
								</Text>
							</TouchableOpacity>
						</View>
						<TouchableOpacity
							onPress={() => {
								setLinkDialogVisible(true);
							}}
							style={{ paddingLeft: 15 }}
							testID="links-touchable"
						>
							{renderLinks()}
						</TouchableOpacity>
						<LinkBottomSheet
							isVisible={isLinkDialogVisible}
							setIsVisible={setLinkDialogVisible}
							links={primaryProfileData.links.data}
						/>
						{renderFollowOrEdit()}
						{currentRoomData !== null && (
							<TouchableOpacity
								onPress={navigateToRoomPage}
								style={{ paddingLeft: 20 }}
								testID="now-playing"
							>
								<NowPlaying
									name={currentRoomData.name}
									creator={currentRoomData.username}
									art={currentRoomData.backgroundImage}
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
						{primaryProfileData.fav_songs.count > 0 && (
							<View style={{ paddingHorizontal: 20 }} testID="fav-songs">
								<View style={styles.profileHeader}>
									<Text style={styles.title}>Favorite Songs</Text>
									{primaryProfileData.fav_songs.count > 4 && (
										<TouchableOpacity
											onPress={() => {
												navigateToMore(
													"song",
													primaryProfileData.fav_songs.data,
													"Favorite Songs",
												);
											}}
										>
											<Text
												style={{
													fontWeight: "700",
													textAlign: "center",
												}}
											>
												More
											</Text>
										</TouchableOpacity>
									)}
								</View>
								{primaryProfileData.fav_songs.data
									.slice(0, 4)
									.map((song: any) => (
										<FavoriteSongs
											key={song.spotify_id}
											songTitle={song.title}
											artist={song.artists.join(", ")}
											duration={
												song.duration ? createTimeString(song.duration) : null
											}
											albumArt={song.cover}
											onPress={() => {}}
										/>
									))}
							</View>
						)}
						{!favRoomError && primaryProfileData.fav_rooms.count > 0 && (
							<>
								<View style={styles.profileHeader} testID="fav-rooms">
									<Text
										style={[
											styles.title,
											{ paddingHorizontal: 20, paddingTop: 10 },
										]}
									>
										Favorite Rooms
									</Text>
									{primaryProfileData.fav_rooms.count > 10 && (
										<TouchableOpacity
											onPress={() => {
												navigateToMore(
													"room",
													favoriteRoomData,
													"Favorite Rooms",
												);
											}}
										>
											<Text
												style={{
													fontWeight: "700",
													textAlign: "center",
													paddingRight: 15,
												}}
											>
												More
											</Text>
										</TouchableOpacity>
									)}
								</View>
								<AppCarousel
									data={favoriteRoomData
										.slice(0, 10)
										.map((room: RoomDto) => room)}
									renderItem={renderItem}
								/>
							</>
						)}
						{!recentRoomError && primaryProfileData.recent_rooms.count > 0 && (
							<>
								<View style={styles.profileHeader} testID="recent-rooms">
									<Text
										style={[
											styles.title,
											{ paddingHorizontal: 20, paddingTop: 10 },
										]}
									>
										Recent Rooms
									</Text>
									{primaryProfileData.recent_rooms.count > 10 && (
										<TouchableOpacity
											onPress={() => {
												navigateToMoreRooms(recentRoomData, "Recent Rooms");
											}}
										>
											<Text
												style={{
													fontWeight: "700",
													textAlign: "center",
													paddingRight: 15,
												}}
											>
												More
											</Text>
										</TouchableOpacity>
									)}
								</View>
								<AppCarousel
									data={recentRoomData
										.slice(0, 10)
										.map((room: RoomDto) => room)}
									renderItem={renderItem}
								/>
							</>
						)}
					</>
				) : (
					<>
						<View style={styles.errorMessage}>
							<Text>Failed to load content</Text>
							<Text>Try refreshing</Text>
						</View>
					</>
				)}
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
		backgroundColor: colors.primary,
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
	errorMessage: {
		flex: 1, // Make the View take up the full screen
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 320,
		width: "100%",
	},
});

export default ProfileScreen;
