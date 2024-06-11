import React, { useState, useRef, useCallback, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { Link, useRouter } from "expo-router";
import RoomCardWidget from "../components/RoomCardWidget";
import { Room } from "../models/Room";
import { Friend } from "../models/friend";
import AppCarousel from "../components/AppCarousel";
import FriendsGrid from "../components/FriendsGrid";
import TopNavBar from "../components/TopNavBar";
import NavBar from "../components/NavBar";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Home: React.FC = () => {
  const [scrollY] = useState(new Animated.Value(0));
  const [friends, setFriends] = useState<Friend[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const previousScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const baseURL = "http://192.168.56.1:3000";

  const BackgroundIMG: string =
    "https://images.pexels.com/photos/255379/pexels-photo-255379.jpeg?auto=compress&cs=tinysrgb&w=600";
  const ProfileIMG: string =
    "https://cdn-icons-png.freepik.com/512/3135/3135715.png";
  const sampleRoomCards: Room[] = [
    {
      backgroundImage: BackgroundIMG,
      name: "Chill Vibes",
      songName: "Song Title",
      artistName: "Artist Name",
      description: "A description of the room goes here.",
      userProfile: ProfileIMG,
      username: "User123",
      tags: ["Tag1", "Tag2", "Tag3"],
    },
    {
      backgroundImage: BackgroundIMG,
      name: "Chill Vibes",
      songName: "Song Title",
      artistName: "Artist Name",
      description: "A description of the room goes here.",
      userProfile: ProfileIMG,
      username: "User123",
      tags: ["Tag1", "Tag2", "Tag3"],
    },
    // Add your sample rooms here...
  ];

  const sampleFriends: Friend[] = [
    {
      profilePicture: ProfileIMG,
      name: "Friend 1",
    },
    {
      profilePicture: ProfileIMG,
      name: "Friend 2",
    },
    {
      profilePicture: ProfileIMG,
      name: "Friend 3",
    },
    {
      profilePicture: ProfileIMG,
      name: "Friend 4",
    },
    {
      profilePicture: ProfileIMG,
      name: "Friend 5",
    },
    {
      profilePicture: ProfileIMG,
      name: "Friend 6",
    },
    {
      profilePicture: ProfileIMG,
      name: "Friend 7",
    },
    {
      profilePicture: ProfileIMG,
      name: "Friend 8",
    },
    // Add more sample friends...
  ];

  const getMyRooms = async (token) => {
    try {
      const response = await axios.get(`${baseURL}/users/rooms`, {
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

  
  const [myRooms, setMyRooms] = useState<Room[]>([]);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getTokenAndRooms = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
      console.log("HomeToken", storedToken);

      if (storedToken) {
        const rooms = await getMyRooms(storedToken);
        const formattedRooms = rooms.map(room => ({
          backgroundImage: room.room_image,
          name: room.room_name,
          songName: room.current_song.title || "No current song",
          artistName: room.current_song.artists.join(", ") || "No artists",
          description: room.description,
          userProfile: room.creator.profile_picture_url,
          username: room.creator.username,
          tags: room.tags,
          mine: true,
        }));
        setMyRooms(formattedRooms);
      }
    };

    getTokenAndRooms();
  }, []);

  useEffect(() => {
    const getTokenAndData = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      setToken(storedToken);
      console.log("HomeToken", storedToken);
  
      if (storedToken) {
        // Fetch rooms
        const rooms = await getMyRooms(storedToken);
        const formattedRooms = rooms.map(room => ({
          backgroundImage: room.room_image,
          name: room.room_name,
          songName: room.current_song.title || "No current song",
          artistName: room.current_song.artists.join(", ") || "No artists",
          description: room.description,
          userProfile: room.creator.profile_picture_url,
          username: room.creator.username,
          tags: room.tags,
          mine: true,
        }));
        setMyRooms(formattedRooms);
  
        // Fetch friends
        const fetchedFriends = await getFriends(storedToken);
        const formattedFriends = fetchedFriends.map(friend => ({
          profilePicture: friend.profile_picture_url,
          name: friend.profile_name,
        }));
        setFriends(formattedFriends);
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
  }, []);

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
          <AppCarousel data={sampleRoomCards} renderItem={renderItem} />
          <Text className="text-2xl font-bold text-gray-800 mt-7 mb-5 ml-8">
            Picks for you
          </Text>
          <AppCarousel data={sampleRoomCards} renderItem={renderItem} />
          <TouchableOpacity className="mt-7" onPress={navigateToAllFriends}>
            <Text className="text-2xl font-bold text-gray-800 mt-2 mb-2 ml-8">
              Friends
            </Text>
          </TouchableOpacity>
          <FriendsGrid friends={friends} maxVisible={8} />
          <Text className="text-2xl font-bold text-gray-800 mb-5 ml-8">
            My Rooms
          </Text>
          <AppCarousel data={myRooms} renderItem={renderItem} />
        </View>
      </ScrollView>
      <Animated.View
        style={{
          transform: [{ translateY: buttonTranslateY }],
          position: "absolute",
          bottom: 9,
          right: 5,
          zIndex: 20,
        }}
      >
        <TouchableOpacity
          className="bg-blue-500 rounded-2xl right-4 bottom-20 w-14 h-14 flex items-center justify-center p-2"
          onPress={navigateToCreateNew}
        >
          <Text className="text-white text-3xl font-bold">+</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View
        style={{
          transform: [{ translateY: navBarTranslateY }],
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <NavBar />
      </Animated.View>
    </View>
  );
};

export default Home;
