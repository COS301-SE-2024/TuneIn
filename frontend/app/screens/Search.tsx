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
  Modal,
  FlatList,
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

const roomFilterCategories = [
  { id: 'roomName', label: 'Room Name' },
  { id: 'username', label: 'Host' },
  { id: 'participationCount', label: 'Participation Count' },
  { id: 'description', label: 'Description' },
  { id: 'isTemporary', label: 'Temporary' },
  { id: 'isPrivate', label: 'Private' },
  { id: 'isScheduled', label: 'Scheduled' },
//   { id: 'startDate', label: 'Start Date' },
//   { id: 'endDate', label: 'End Date' },
  { id: 'language', label: 'Language' },
  { id: 'explicit', label: 'Explicit' },
  { id: 'nsfw', label: 'NSFW' },
  { id: 'tags', label: 'Tags' },
];

const userFilterCategories = [
  { id: 'profileName', label: 'Profile Name' },
  { id: 'username', label: 'Username' },
//   { id: 'minFollowing', label: 'Minimum Number of Following' },
//   { id: 'minFollowers', label: 'Minimum Number of Followers' },
];

const allFilterCategories = [...roomFilterCategories, ...userFilterCategories];

const Search: React.FC = () => {
  const navigation = useNavigation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "room" | "user">("all");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [scrollY] = useState(new Animated.Value(0));
  const previousScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

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
    const filteredResults = mockResults.filter((result) => {
      if (filter === "all") {
        return (
          result.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          selectedFilters.length === 0
        );
      }
      return (
        result.type === filter &&
        result.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
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

  const handleFilterToggle = (id: string) => {
    setSelectedFilters((prevSelectedFilters) =>
      prevSelectedFilters.includes(id)
        ? prevSelectedFilters.filter((filterId) => filterId !== id)
        : [...prevSelectedFilters, id]
    );
  };

  return (
    <View style={styles.container}>
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} testID="back-button">
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
        <TouchableOpacity style={styles.searchIcon} onPress={handleSearch}  testID="search-button">
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
        <TouchableOpacity style={styles.filterButton} onPress={() => setModalVisible(true)} testID="filter-button">
          <Ionicons name="filter" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.selectedFiltersContainer}>
        {selectedFilters.map((filter) => (
          <View key={filter} style={styles.selectedFilter}>
            <Text style={styles.selectedFilterText}>
              {filter === 'roomName' ? 'Room Name' :
              filter === 'username' ? 'Username of Creator' :
              filter === 'participationCount' ? 'Participation Count' :
              filter === 'description' ? 'Description' :
              filter === 'isTemporary' ? 'Temporary' :
              filter === 'isPrivate' ? 'Private' :
              filter === 'isScheduled' ? 'Scheduled' :
              filter === 'startDate' ? 'Start Date' :
              filter === 'endDate' ? 'End Date' :
              filter === 'language' ? 'Language' :
              filter === 'explicit' ? 'Explicit' :
              filter === 'nsfw' ? 'NSFW' :
              filter === 'tags' ? 'Tags' :
              filter === 'profileName' ? 'Profile Name' :
              filter === 'username' ? 'Username' :
              filter === 'minFollowing' ? 'Minimum Number of Following' :
              filter === 'minFollowers' ? 'Minimum Number of Followers' :
              filter}
            </Text>
            <TouchableOpacity onPress={() => handleFilterToggle(filter)}>
              <Ionicons name="close-circle" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        testID="scroll-view"
      >
        <View style={styles.resultContainer}>
		  <FlatList
			data={results}
			keyExtractor={(item) => item.id}
			renderItem={renderResult}
		  />
		</View>
      </ScrollView>

      <Animated.View
        style={[styles.navBar, { transform: [{ translateY: navBarTranslateY }] }]}
      >
        <NavBar />
      </Animated.View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
        testID="filter-modal"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Filters</Text>
            <FlatList
              data={filter === "all" ? allFilterCategories : filter === "room" ? roomFilterCategories : userFilterCategories}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleFilterToggle(item.id)}
                  testID={`filter-option-${item.id}`}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                  {selectedFilters.includes(item.id) && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              testID="close-button"
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
	  fontWeight: "bold",
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
	  paddingBottom: 50,
	},
	navBar: {
	  position: "absolute",
	  bottom: 0,
	  left: 0,
	  right: 0,
	  zIndex: 10,
	},
	modalContainer: {
	  flex: 1,
	  justifyContent: "center",
	  alignItems: "center",
	  backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
	  width: "80%",
	  backgroundColor: "white",
	  borderRadius: 10,
	  padding: 20,
	  alignItems: "center",
	},
	modalTitle: {
	  fontSize: 20,
	  marginBottom: 20,
	},
	modalItem: {
	  flexDirection: "row",
	  justifyContent: "space-between",
	  width: "100%",
	  paddingVertical: 10,
	  borderBottomWidth: 1,
	  borderBottomColor: "#ccc",
	},
	modalItemText: {
	  fontSize: 18,
	},
	closeButton: {
	  marginTop: 20,
	  paddingVertical: 10,
	  paddingHorizontal: 20,
	  backgroundColor: colors.primary,
	  borderRadius: 5,
	},
	closeButtonText: {
	  color: "white",
	  fontSize: 16,
	},
	selectedFiltersContainer: {
	  flexDirection: "row",
	  flexWrap: "wrap",
	  alignItems: "center",
	  marginBottom: 20,
	},
	selectedFilter: {
	  flexDirection: "row",
	  alignItems: "center",
	  backgroundColor: "#fff",
	  borderRadius: 20,
	  paddingVertical: 5,
	  paddingHorizontal: 10,
	  margin: 5,
	  borderWidth: 1,
	  borderColor: "#ccc",
	  shadowColor: "#000",
	  shadowOffset: { width: 0, height: 4 },
	  shadowOpacity: 0.25,
	  shadowRadius: 5.84,
	  elevation: 5,
	},
	selectedFilterText: {
	  marginRight: 5,
	},
  });
  
  export default Search;
  
