import React, {
	useState,
	useRef,
	useCallback,
	useContext,
	useEffect,
} from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Animated,
	StyleSheet,
	ActivityIndicator,
	NativeScrollEvent,
	NativeSyntheticEvent,
	RefreshControl,
	ToastAndroid,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import RoomCardWidget from "../../components/rooms/RoomCardWidget";
import { Room } from "../../models/Room";
import { Friend } from "../../models/friend";
import AppCarousel from "../../components/AppCarousel";
import FriendsGrid from "../../components/FriendsGrid";
import Miniplayer from "../../components/home/miniplayer";
import axios, { AxiosResponse } from "axios";
import auth from "../../services/AuthManagement";
import { live, instanceExists } from "../../services/Live";
import * as utils from "../../services/Utils";
import { Player } from "../../PlayerContext";
import { colors } from "../../styles/colors";
import TopNavBar from "../../components/TopNavBar";
import { useAPI } from "../../APIContext";
import { UserDto } from "../../../api";
import { RequiredError } from "../../../api/base";

const Home: React.FC = () => {
	const playerContext = useContext(Player);
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	const { userData, setUserData } = playerContext;

	const { users, authenticated } = useAPI();
	const [currentUser, setCurrentUser] = useState<UserDto>();
	if (authenticated && !currentUser) {
		users
			.getProfile()
			.then((user: AxiosResponse<UserDto>) => {
				if (user.status === 401 || user.status === 500) {
					// Handle errors
				}
				setCurrentUser(user.data);
			})
			.catch((error) => {
				if (error instanceof RequiredError) {
					// Handle required field error
				} else {
					// Handle other errors
				}
			});
	}

	const [errorMessage, setErrorMessage] = useState<string>("");
	const [roomError, setRoomError] = useState<boolean>(false);
	const [profileError, setProfileError] = useState<boolean>(false);
	const [friendError, setFriendError] = useState<boolean>(false);
	const [scrollY] = useState(new Animated.Value(0));
	const [friends, setFriends] = useState<Friend[]>([]);
	const [loading, setLoading] = useState(true);
	const scrollViewRef = useRef<ScrollView>(null);
	const previousScrollY = useRef(0);
	const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

	if (!instanceExists()) {
		live.initialiseSocket();
	}

	const BackgroundIMG: string =
		"https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600";
	const ProfileIMG: string =
		"https://upload.wikimedia.org/wikipedia/commons/b/b5/Windows_10_Default_Profile_Picture.svg";

	const fetchRooms = async (token: string | null, type?: string) => {
		try {
			const response = await axios.get(
				`${utils.API_BASE_URL}/users/rooms${type ? type : ""}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setRoomError(false);
			return response.data;
		} catch (error) {
			console.log("Error fetching rooms:", error);
			setRoomError(true);
			return [];
		}
	};

	const getFriends = async (token: string) => {
		try {
			const response = await axios.get(`${utils.API_BASE_URL}/users/friends`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			setFriendError(false);
			return response.data;
		} catch (error) {
			console.log("Error fetching friends:", error);
			setFriendError(true);
			return [];
		}
	};

	const fetchProfileInfo = async (token: string) => {
		try {
			if (token) {
				const response = await axios.get(`${utils.API_BASE_URL}/users`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setProfileError(false);
				return response.data;
			}
		} catch (error) {
			console.log("Error fetching profile info:", error);
			setProfileError(true);
		}
	};

	const formatRoomData = (rooms: any, mine = false) => {
		if (!Array.isArray(rooms)) {
			return [];
		}

		return rooms.map((room, index) => {
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
				userProfile: room.creator
					? room.creator.profile_picture_url
					: ProfileIMG,
				username: room.creator ? room.creator.username : "Unknown",
				roomSize: 50,
				tags: room.tags ? room.tags : [],
				mine: mine,
				isNsfw: room.has_nsfw_content,
				isExplicit: room.has_explicit_content,
				isPrivate: room.is_private,
				isScheduled: room.is_scheduled,
				start_date: room.start_date,
				end_date: room.end_date,
				date_created: room.date_created,
				childrenRoomIDs: room.childrenRoomIDs,
			};
		});
	};

	const [myRooms, setMyRooms] = useState<Room[]>([]);
	const [myPicks, setMyPicks] = useState<Room[]>([]);
	const [myRecents, setMyRecents] = useState<Room[]>([]);
	const [friendRooms, setFriendRooms] = useState<Room[]>([]);
	const [followingRooms, setFollowingRooms] = useState<Room[]>([]);

	const refreshData = useCallback(async () => {
		setLoading(true);
		const storedToken = await auth.getToken();
		if (storedToken) {
			console.log("Loading data...");
			const recentRooms = await fetchRooms(storedToken, "/recent");
			const formattedRecentRooms = formatRoomData(recentRooms);

			const picksForYouRooms = await fetchRooms(storedToken, "/foryou");
			const formattedPicksForYouRooms = formatRoomData(picksForYouRooms);

			const myRoomsData = await fetchRooms(storedToken);
			const formattedMyRooms = formatRoomData(myRoomsData, true);

			const friendRoomsData = await fetchRooms(storedToken, "/friends");
			const formattedFriendRooms = formatRoomData(friendRoomsData);

			const followingRoomsData = await fetchRooms(storedToken, "/following");
			const formattedFollowingRooms = formatRoomData(followingRoomsData);

			setMyRooms(formattedMyRooms);
			setMyPicks(formattedPicksForYouRooms);
			setMyRecents(formattedRecentRooms);
			setFriendRooms(formattedFriendRooms);
			setFollowingRooms(formattedFollowingRooms);

			if (!userData) {
				const userInfo = await fetchProfileInfo(storedToken);
				setUserData(userInfo);
			}

			const fetchedFriends = await getFriends(storedToken);
			const formattedFriends: Friend[] = Array.isArray(fetchedFriends)
				? fetchedFriends.map((friend: Friend) => ({
						profile_picture_url: friend.profile_picture_url || ProfileIMG,
						username: friend.username,
						friend_id: friend.friend_id,
					}))
				: [];
			setFriends(formattedFriends);
			console.log("Data loaded");
		}
		setLoading(false);
	}, [setUserData, userData, ProfileIMG]);

	useEffect(() => {
		refreshData();
	}, [refreshData]);

	const [refreshing] = useState(false);

	const onRefresh = useCallback(() => {
		setLoading(true);
		refreshData();
		setTimeout(() => {
			setLoading(false);
		}, 2000);
	}, [refreshData]);

	const renderItem = ({ item }: { item: Room }) => (
		<RoomCardWidget roomCard={item} />
	);

	const router = useRouter();

	const navigateToAllFriends = () => {
		const safeUserData = userData ?? { username: "defaultUser" };

		router.navigate({
			pathname: "/screens/followers/FollowerStack",
			params: { username: safeUserData.username },
		});
	};

	const navigateToMyRooms = () => {
		router.navigate({
			pathname: "/screens/rooms/MyRooms",
			params: { myRooms: JSON.stringify(myRooms) },
		});
	};

	const navigateToMoreRooms = (rooms: Room[], Name: string) => {
		router.navigate({
			pathname: "/screens/rooms/MoreRooms",
			params: { rooms: JSON.stringify(rooms), name: Name },
		});
	};

	const handleScroll = useCallback(
		({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
			const currentOffset = nativeEvent.contentOffset.y;
			const direction = currentOffset > previousScrollY.current ? "down" : "up";
			previousScrollY.current = currentOffset;
			scrollY.setValue(currentOffset);

			if (scrollTimeout.current) {
				clearTimeout(scrollTimeout.current);
			}

			scrollTimeout.current = setTimeout(() => {
				if (currentOffset <= 0 || direction === "up") {
					Animated.timing(scrollY, {
						toValue: 0,
						duration: 200,
						useNativeDriver: true,
					}).start();
				}
			}, 100);
		},
		[scrollY],
	);

	useEffect(() => {
		if (!roomError || !friendError) {
			if (roomError && !friendError) {
				if (Platform.OS === "android")
					ToastAndroid.show("Failed to load rooms", ToastAndroid.SHORT);
			} else if (!roomError && friendError) {
				if (Platform.OS === "android")
					ToastAndroid.show("Failed to load friends", ToastAndroid.SHORT);
			} else if (profileError) {
				if (Platform.OS === "android")
					ToastAndroid.show("Failed to load profile data", ToastAndroid.SHORT);
			}
		}
	}, [roomError, friendError, profileError]);

	return (
		<View style={styles.container}>
			<TopNavBar />
			<ScrollView
				ref={scrollViewRef}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				{loading ? (
					<ActivityIndicator size={60} style={{ marginTop: 260 }} />
				) : !roomError || !friendError ? (
					<View style={styles.contentContainer}>
						{!roomError && (
							<>
								{myRecents.length > 0 && (
									<>
										<TouchableOpacity
											style={styles.navigateButton}
											onPress={() =>
												navigateToMoreRooms(myRecents, "Recent Rooms")
											}
										>
											<Text style={styles.sectionTitle}>Recent Rooms</Text>
										</TouchableOpacity>

										<AppCarousel data={myRecents} renderItem={renderItem} />
									</>
								)}
								{followingRooms.length > 0 && (
									<>
										<TouchableOpacity
											style={styles.navigateButton}
											onPress={() =>
												navigateToMoreRooms(
													followingRooms,
													"From People You Follow",
												)
											}
										>
											<Text style={styles.sectionTitle}>
												From People You Follow
											</Text>
										</TouchableOpacity>
										<AppCarousel
											data={followingRooms}
											renderItem={renderItem}
										/>
									</>
								)}
								{friendRooms.length > 0 && (
									<>
										<TouchableOpacity
											style={styles.navigateButton}
											onPress={() =>
												navigateToMoreRooms(friendRooms, "More From Friends")
											}
										>
											<Text style={styles.sectionTitle}>More From Friends</Text>
										</TouchableOpacity>
										<AppCarousel data={friendRooms} renderItem={renderItem} />
									</>
								)}
								<TouchableOpacity
									style={styles.navigateButton}
									onPress={() => navigateToMoreRooms(myPicks, "Picks for you")}
								>
									<Text style={styles.sectionTitle}>Picks for you</Text>
								</TouchableOpacity>
								<AppCarousel data={myPicks} renderItem={renderItem} />
							</>
						)}
						{!friendError && userData && userData.username ? (
							<>
								<TouchableOpacity
									style={styles.navigateButton}
									onPress={navigateToAllFriends}
								>
									<Text style={styles.sectionTitle}>Friends</Text>
								</TouchableOpacity>
								<FriendsGrid friends={friends} username={userData.username} />
							</>
						) : null}
						<TouchableOpacity
							style={styles.navigateButton}
							onPress={navigateToMyRooms}
						>
							<Text style={styles.sectionTitle}>My Rooms</Text>
						</TouchableOpacity>
						<AppCarousel
							data={myRooms}
							renderItem={renderItem}
							showAddRoomCard={true} // Conditionally show the AddRoomCard
						/>
					</View>
				) : (
					<>
						<View style={styles.errorMessage}>
							<Text>Failed to load content</Text>
							<Text>Try refreshing</Text>
						</View>
					</>
				)}
			</ScrollView>
			<Miniplayer />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: colors.backgroundColor,
	},
	contentContainer: {
		flex: 1,
		justifyContent: "center",
	},
	errorMessage: {
		flex: 1, // Make the View take up the full screen
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
	},
	sectionTitle: {
		fontSize: 24,
		fontWeight: "bold",
		textAlign: "center",
		marginTop: 20,
		marginBottom: 10,
	},
	navigateButton: {
		marginTop: 20,
	},
	createRoomButtonContainer: {
		position: "absolute",
		bottom: 15,
		right: 15,
		zIndex: 20,
	},
	createRoomButton: {
		backgroundColor: colors.primary,
		borderRadius: 30,
		width: 50,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 70,
	},
	createRoomButtonText: {
		color: "white",
		fontSize: 40, // Increased from 32 to 40
		fontWeight: "bold",
	},
});

export default Home;
