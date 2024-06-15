import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Link, useRouter } from "expo-router";
import RoomCardWidget from "../components/RoomCardWidget";
import { Room } from "../models/Room";
import { Friend } from "../models/friend";
import AppCarousel from "../components/AppCarousel";
import FriendsGrid from "../components/FriendsGrid";
import TopNavBar from "../components/TopNavBar";
import { AuthUser, getCurrentUser } from 'aws-amplify/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";



const Home: React.FC = () => {
  const [scrollY] = useState(new Animated.Value(0));
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let token: string = "";
    const fetchUser = async () => {
      try {
        token = await AsyncStorage.getItem("token");
        console.log("Token stuff", token);
        const user: AuthUser = await getCurrentUser(); // Updated method call
        setAuthUser(user);
        console.log("User stuff" ,user);
      } catch (error) {
        console.error("Oopsie error" ,error);
      }
    };

    fetchUser();
    

    console.log("this is the token and stuffs", token);
  }, []);





  const BackgroundIMG: string =
    "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600";
  const ProfileIMG: string =
    "https://cdn-icons-png.freepik.com/512/3135/3135715.png";

  const fetchRooms = async (token: string | null, type?: string) => {
    try {
      const response = await axios.get(`${baseURL}/users/rooms${type ? type : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  };

  const getFriends = async (token) => {
    try {
      const response = await axios.get(`${baseURL}/users/friends`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  };

  const formatRoomData = (rooms: any[], mine: boolean = false) => {
    return rooms.map(room => ({
      backgroundImage: room.room_image ? room.room_image : BackgroundIMG,
      name: room.room_name,
      songName: room.current_song ? (room.current_song.title || "No current song") : "No current song",
      artistName: room.current_song ? (room.current_song.artists.join(", ") || "No artists") : "No artists",
      description: room.description,
      userProfile: room.creator ? room.creator.profile_picture_url : ProfileIMG,
      username: room.creator ? room.creator.username : "Unknown",
      tags: room.tags ? room.tags : [],
      mine: mine,
    }));
  };

  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [myPicks, setMyPicks] = useState<Room[]>([]);
  const [myRecents, setMyRecents] = useState<Room[]>([]);
  const [loadingRooms, setLoadingRooms] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getTokenAndData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);

      if (storedToken) {
        setLoadingRooms(true);
        setLoadingFriends(true);
        
        // Fetch recent rooms
        setLoadingRooms(true);
        const recentRooms = await fetchRooms(storedToken, '/recent');
        const formattedRecentRooms = formatRoomData(recentRooms);
        
        // Fetch picks for you
        const picksForYouRooms = await fetchRooms(storedToken, '/foryou');
        const formattedPicksForYouRooms = formatRoomData(picksForYouRooms);
        
        // Fetch My Rooms
        const myRoomsData = await fetchRooms(storedToken);
        const formattedMyRooms = formatRoomData(myRoomsData, true);

        setMyRooms(formattedMyRooms);
        setMyPicks(formattedPicksForYouRooms);
        setMyRecents(formattedRecentRooms);
        setLoadingRooms(false);

        // Fetch friends
        setLoadingFriends(true);
        const fetchedFriends = await getFriends(storedToken);
        const formattedFriends = fetchedFriends.map(friend => ({
          profilePicture: friend.profile_picture_url ? friend.profile_picture_url : ProfileIMG,
          name: friend.profile_name,
        }));
        setFriends(formattedFriends);
        setLoadingFriends(false);
        setLoadingRooms(false);
        setLoadingFriends(false);
      }
    };

    getTokenAndData();
  }, []);

  const renderItem = ({ item }: { item: Room }) => (
    <Link
      href={{
        pathname: "/screens/RoomPage",
        params: { room: JSON.stringify(item) },
      }}
    >
      <RoomCardWidget roomCard={item} />
    </Link>
  );

  const router = useRouter();

  const navigateToAllFriends = () => {
    router.navigate("/screens/AllFriends");
  };

  const navigateToCreateNew = () => {
    router.navigate("/screens/CreateRoom");
  };

  const handleScroll = useCallback(({ nativeEvent }) => {
    const offsetY = nativeEvent.contentOffset.y;
    scrollY.setValue(offsetY);
  }, []);

  const topNavBarTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, -100],
    extrapolate: "clamp",
  });

  return (
    <View className="flex-1">
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
        contentContainerStyle={{ paddingTop: 40 }}
      >
        <View className="flex-1 justify-center pt-4">
          <Text className="text-2xl font-bold text-gray-800 mt-2 mb-5 ml-8">
            Recent Rooms
          </Text>
          {loadingRooms ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            {loadingRooms ? <ActivityIndicator size="large" /> : <AppCarousel data={myRecents} renderItem={renderItem} />}
          )}
          <Text className="text-2xl font-bold text-gray-800 mt-7 mb-5 ml-8">
            Picks for you
          </Text>
          {loadingRooms ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            {loadingRooms ? <ActivityIndicator size="large" /> : <AppCarousel data={myPicks} renderItem={renderItem} />}
          )}
          <TouchableOpacity className="mt-7" onPress={navigateToAllFriends}>
            <Text className="text-2xl font-bold text-gray-800 mt-2 mb-2 ml-8">
              Friends
            </Text>
          </TouchableOpacity>
          {loadingFriends ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            {loadingFriends ? <ActivityIndicator size="large" /> : <FriendsGrid friends={friends} maxVisible={8} />}
          )}
          <Text className="text-2xl font-bold text-gray-800 mb-5 ml-8">
            My Rooms
          </Text>
          {loadingRooms ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            {loadingRooms ? <ActivityIndicator size="large" /> : <AppCarousel data={myRooms} renderItem={renderItem} />}
          )}
        </View>
      </ScrollView>
      <TouchableOpacity
        className="absolute bottom-4 right-4 bg-blue-500 rounded-2xl w-14 h-14 flex items-center justify-center p-2"
        onPress={navigateToCreateNew}
      >
        <Text className="text-white text-3xl font-bold">+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Home;
