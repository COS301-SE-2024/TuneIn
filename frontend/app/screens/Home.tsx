import React, { useState, useRef, useCallback, useEffect } from "react";
import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	Animated,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { Link, useRouter } from "expo-router";
import RoomCardWidget from "../components/RoomCardWidget";
import { Room } from "../models/Room";
import { Friend } from "../models/friend";
import AppCarousel from "../components/AppCarousel";
import FriendsGrid from "../components/FriendsGrid";
import TopNavBar from "../components/TopNavBar";
import NavBar from "../components/NavBar";
import * as StorageService from "./../services/StorageService"; // Import StorageService
import axios from "axios";
import auth from "./../services/AuthManagement"; // Import AuthManagement
import * as utils from "./../services/Utils"; // Import Utils

const Home: React.FC = () => {
	const [scrollY] = useState(new Animated.Value(0));
	const [friends, setFriends] = useState<Friend[]>([]);
	const [loading, setLoading] = useState(true);
	const scrollViewRef = useRef<ScrollView>(null);
	const previousScrollY = useRef(0);
	const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

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
			return response.data;
		} catch (error) {
			console.error("Error fetching rooms:", error);
			return [];
		}
	};

	const getFriends = async (token: string) => {
		try {
			const response = await axios.get(`${utils.API_BASE_URL}/users/friends`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			return response.data;
		} catch (error) {
			console.error("Error fetching friends:", error);
			return [];
		}
	};

	const formatRoomData = (rooms: any[], mine: boolean = false) => {
		return rooms.map((room) => ({
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
			roomSize: "50",
			tags: room.tags ? room.tags : [],
			mine: mine,
			isNsfw: room.has_nsfw_content,
			isExplicit: room.has_explicit_content,
		}));
	};

	const [myRooms, setMyRooms] = useState<Room[]>([]);
	const [myPicks, setMyPicks] = useState<Room[]>([]);
	const [myRecents, setMyRecents] = useState<Room[]>([]);

	const loadCachedData = async () => {
		try {
			const cachedRecents = await StorageService.getItem("cachedRecents");
			const cachedPicks = await StorageService.getItem("cachedPicks");
			const cachedMyRooms = await StorageService.getItem("cachedMyRooms");
			const cachedFriends = await StorageService.getItem("cachedFriends");

			if (cachedRecents) setMyRecents(JSON.parse(cachedRecents));
			if (cachedPicks) setMyPicks(JSON.parse(cachedPicks));
			if (cachedMyRooms) setMyRooms(JSON.parse(cachedMyRooms));
			if (cachedFriends) setFriends(JSON.parse(cachedFriends));
		} catch (error) {
			console.error("Error loading cached data:", error);
		}
	};

	const refreshData = async () => {
		setLoading(true);
		const storedToken = await auth.getToken();

		if (storedToken) {
			// Fetch recent rooms
			const recentRooms = await fetchRooms(storedToken, "/recent");
			const formattedRecentRooms = formatRoomData(recentRooms);

			// Fetch picks for you
			const picksForYouRooms = await fetchRooms(storedToken, "/foryou");
			const formattedPicksForYouRooms = formatRoomData(picksForYouRooms);

			// Fetch My Rooms
			const myRoomsData = await fetchRooms(storedToken);
			const formattedMyRooms = formatRoomData(myRoomsData, true);

			setMyRooms(formattedMyRooms);
			setMyPicks(formattedPicksForYouRooms);
			setMyRecents(formattedRecentRooms);

			await StorageService.setItem(
				"cachedRecents",
				JSON.stringify(formattedRecentRooms),
			);
			await StorageService.setItem(
				"cachedPicks",
				JSON.stringify(formattedPicksForYouRooms),
			);
			await StorageService.setItem(
				"cachedMyRooms",
				JSON.stringify(formattedMyRooms),
			);

			// Fetch friends
			const fetchedFriends = await getFriends(storedToken);
			const formattedFriends = fetchedFriends.map((friend) => ({
				profilePicture: friend.profile_picture_url
					? friend.profile_picture_url
					: ProfileIMG,
				name: friend.profile_name,
			}));
			setFriends(formattedFriends);

			await StorageService.setItem(
				"cachedFriends",
				JSON.stringify(formattedFriends),
			);
		}

		setLoading(false);
	};

	useEffect(() => {
		const initialize = async () => {
			await loadCachedData();
			await refreshData();
		};
		initialize();

		/*
		const interval = setInterval(() => {
			refreshData();
		}, 240000); // Refresh data every 60 seconds

		return () => clearInterval(interval);
		*/
		return () => {};
	}, []);

	const renderItem = ({ item }: { item: Room }) => (
		<Link
			href={{
				pathname: "/screens/rooms/RoomPage",
				params: { room: JSON.stringify(item) },
			}}
		>
			<RoomCardWidget roomCard={item} />
		</Link>
	);

	const router = useRouter();
	const navigateToAllFriends = () => {
		console.log("Navigating to all friends");
		router.navigate("/screens/AllFriends");
	};

	const navigateToCreateNew = () => {
		console.log("Navigating to create new room");
		router.navigate("/screens/CreateRoom");
	};

	const handleScroll = useCallback(
		({ nativeEvent }) => {
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
						duration: 150,
						useNativeDriver: true,
					}).start();
				} else {
					Animated.timing(scrollY, {
						toValue: 100,
						duration: 150,
						useNativeDriver: true,
					}).start();
				}
			}, 50); // Reduced debounce timeout to make it more responsive
		},
		[scrollY],
	);

	const topNavBarTranslateY = scrollY.interpolate({
		inputRange: [0, 100],
		outputRange: [0, -100],
		extrapolate: "clamp",
	});

	const navBarTranslateY = scrollY.interpolate({
		inputRange: [0, 100],
		outputRange: [0, 100],
		extrapolate: "clamp",
	});

	const buttonTranslateY = scrollY.interpolate({
		inputRange: [0, 100],
		outputRange: [0, 70],
		extrapolate: "clamp",
	});

	return (
		<View style={styles.container}>
			<Animated.View
				style={{
					transform: [{ translateY: topNavBarTranslateY }],
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					zIndex: 10,
				}}
			>
				<TopNavBar />
			</Animated.View>
			<ScrollView
				ref={scrollViewRef}
				onScroll={handleScroll}
				scrollEventThrottle={16}
				contentContainerStyle={styles.scrollViewContent}
			>
				{loading ? (
					<ActivityIndicator
						size={60}
						color="#0000ff"
						style={{ marginTop: 260 }}
					/>
				) : (
					<View style={styles.contentContainer}>
						<Text style={styles.sectionTitle}>Recent Rooms</Text>
						<AppCarousel data={myRecents} renderItem={renderItem} />
						<Text style={styles.sectionTitle}>Picks for you</Text>
						<AppCarousel data={myPicks} renderItem={renderItem} />
						<TouchableOpacity
							style={styles.navigateButton}
							onPress={navigateToAllFriends}
						>
							<Text style={styles.sectionTitle}>Friends</Text>
						</TouchableOpacity>
						<FriendsGrid friends={friends} maxVisible={8} />
						<Text style={styles.sectionTitle}>My Rooms</Text>
						<AppCarousel data={myRooms} renderItem={renderItem} />
					</View>
				)}
			</ScrollView>
			<Animated.View
				style={[
					styles.createRoomButtonContainer,
					{ transform: [{ translateY: buttonTranslateY }] },
				]}
			>
				<TouchableOpacity
					style={styles.createRoomButton}
					onPress={navigateToCreateNew}
				>
					<Text style={styles.createRoomButtonText}>+</Text>
				</TouchableOpacity>
			</Animated.View>
			<Animated.View
				style={[
					styles.navBar,
					{ transform: [{ translateY: navBarTranslateY }] },
				]}
			>
				<NavBar />
			</Animated.View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	topNavBar: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 10,
	},
	scrollViewContent: {
		paddingTop: 40,
	},
	contentContainer: {
		flex: 1,
		justifyContent: "center",
		paddingTop: 20,
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
		bottom: 9,
		right: 15,
		zIndex: 20,
	},
	createRoomButton: {
		backgroundColor: "#1E90FF",
		borderRadius: 20,
		width: 50,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 70,
	},
	createRoomButtonText: {
		color: "white",
		fontSize: 32,
		fontWeight: "bold",
	},
	navBar: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 10,
	},
});

export default Home;
