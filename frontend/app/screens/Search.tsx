import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  StyleSheet,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RoomCardWidget from "../components/rooms/RoomCardWidget";
import UserItem from "../components/UserItem";
import NavBar from "../components/NavBar";
import { colors } from "../styles/colors";
import { Room } from "../models/Room";
import { User } from "../models/user"; 

type SearchResult = {
  id: string;
  type: "room" | "user";
  name: string;
  roomData?: Room;
  userData?: User;
};

const Search: React.FC = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "room" | "user">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [scrollY] = useState(new Animated.Value(0));
  const previousScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const mockResults: SearchResult[] = [
    {
      id: "1",
      type: "room",
      name: "Room 1",
      roomData: {
        roomID: "1",
        backgroundImage: "https://unblast.com/wp-content/uploads/2021/01/Space-Background-Images.jpg",
        name: "Room 1",
        description: "Description 1",
        userID: "1",
        tags: [],
      },
    },
    {
      id: "2",
      type: "user",
      name: "User 1",
      userData: {
        id: "1",
        profile_picture_url: "https://wallpapers.com/images/high/pretty-profile-pictures-6x5bfef0mhb60qyl.webp",
        profile_name: "User 1",
        username: "user1",
      },
    },
    {
      id: "3",
      type: "room",
      name: "Room 2",
      roomData: {
        roomID: "2",
        backgroundImage: "https://unblast.com/wp-content/uploads/2021/01/Space-Background-Images.jpg",
        name: "Room 2",
        description: "Description 2",
        userID: "2",
        tags: [],
      },
    },
    {
      id: "4",
      type: "user",
      name: "User 2",
      userData: {
        id: "2",
        profile_picture_url: "https://wallpapers.com/images/high/pretty-profile-pictures-6x5bfef0mhb60qyl.webp",
        profile_name: "User 2",
        username: "user2",
      },
    },
  ];

  const handleSearch = () => {
    const filteredResults = mockResults.filter(
      (result) =>
        (filter === "all" || result.type === filter) &&
        result.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setResults(filteredResults);
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
      }, 50);
    },
    [scrollY]
  );

  const navBarTranslateY = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 100],
    extrapolate: "clamp",
  });

  const renderResult = ({ item }: { item: SearchResult }) => {
    if (item.type === "room" && item.roomData) {
      return <RoomCardWidget roomCard={item.roomData} />;
    }
    if (item.type === "user" && item.userData) {
      return <UserItem user={item.userData} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={30} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Search</Text>
      </View>

      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}>
          <Ionicons name="search-circle-sharp" size={40} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === "all" && styles.activeFilter]}
          onPress={() => setFilter("all")}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "room" && styles.activeFilter]}
          onPress={() => setFilter("room")}
        >
          <Text style={styles.filterText}>Rooms</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === "user" && styles.activeFilter]}
          onPress={() => setFilter("user")}
        >
          <Text style={styles.filterText}>Users</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {results.map((result) => (
          <View
            key={result.id}
            style={[
              styles.resultContainer,
              result.type === "room" && styles.roomBorder, // Add bottom border for room items
            ]}
          >
            {renderResult({ item: result })}
          </View>
        ))}
      </ScrollView>

      <Animated.View style={[styles.navBar, { transform: [{ translateY: navBarTranslateY }] }]}>
        <NavBar />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    flex: 1,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 56,
    paddingHorizontal: 10,
  },
  searchBar: {
    flex: 1,
    height: 40,
  },
  searchIcon: {
    marginLeft: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  activeFilter: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5.84,
    elevation: 5,
  },
  filterText: {
    color: "#000",
  },
  scrollViewContent: {
    paddingBottom: 100,
    paddingTop: 20,
  },
  resultContainer: {
    marginBottom: 20,
  },
  roomBorder: {
    borderBottomWidth: 1, 
    borderBottomColor: "#ccc", 
	paddingBottom: 20, 
  },
  navBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

export default Search;
