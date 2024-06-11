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



const Home: React.FC = () => {
  const [scrollY] = useState(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user: AuthUser = await getCurrentUser(); // Updated method call
        setAuthUser(user);
        console.log(user);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);





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

  const Myrooms: Room[] = [
    {
      backgroundImage: BackgroundIMG,
      name: "Chill Vibes",
      songName: "Song Title",
      artistName: "Artist Name",
      description: "A description of the room goes here.",
      userProfile: ProfileIMG,
      username: "User123",
      tags: ["Tag1", "Tag2", "Tag3"],
      mine: true, // Set mine to true for "My Rooms"
    },
    {
      backgroundImage: BackgroundIMG,
      name: "Party",
      songName: "Song Title",
      artistName: "Artist Name",
      description: "A description of the room goes here.",
      userProfile: ProfileIMG,
      username: "User123",
      tags: ["Tag1", "Tag2", "Tag3"],
      mine: true, // Set mine to true for "My Rooms"
    },
    // Add your sample rooms here...
  ];

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
          <FriendsGrid friends={sampleFriends} maxVisible={8} />
          <Text className="text-2xl font-bold text-gray-800 mb-5 ml-8">
            My Rooms
          </Text>
          <AppCarousel data={Myrooms} renderItem={renderItem} />
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
