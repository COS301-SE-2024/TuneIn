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

// const userFilterCategories = [
// 	{ id: "profileName", label: "Profile Name" },
//   { id: 'username', label: 'Username' },
// //   { id: 'minFollowing', label: 'Minimum Number of Following' },
// //   { id: 'minFollowers', label: 'Minimum Number of Followers' },
// ];

const allFilterCategories = [...roomFilterCategories];

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
        profile_picture_url: "https://wallpapers-clan.com/wp-content/uploads/2023/11/marvel-iron-man-in-destroyed-suit-desktop-wallpaper-preview.jpg",
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
        profile_picture_url: "https://wallpapers-clan.com/wp-content/uploads/2023/11/marvel-iron-man-in-destroyed-suit-desktop-wallpaper-preview.jpg",
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
      return (
        <View style={styles.roomCardPadding}>
          <RoomCardWidget roomCard={item.roomData} />
        </View>
      );
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
        <Text style={styles.title}>Search  </Text>
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
              filter === 'tags' ? 'Tags' : ''}
            </Text>
            <TouchableOpacity onPress={() => handleFilterToggle(filter)}>
              <Ionicons name="close-circle" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <FlatList
        data={results}
        renderItem={renderResult}
        keyExtractor={(item) => item.id}
        onScroll={handleScroll}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Filter Options</Text>
          <ScrollView>
            {allFilterCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.modalOption,
                  selectedFilters.includes(category.id) &&
                    styles.modalOptionSelected,
                ]}
                onPress={() => handleFilterToggle(category.id)}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedFilters.includes(category.id) &&
                      styles.modalOptionTextSelected,
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.modalCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Animated.View style={[styles.navBar, { transform: [{ translateY: navBarTranslateY }] }]}>
        <NavBar />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
  },
  roomCardPadding: {
    marginTop: 20,
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
  },
  filterText: {
    color: "#333",
    fontWeight: "bold",
  },
  selectedFiltersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  selectedFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eee",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedFilterText: {
    marginRight: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalOptionSelected: {
    backgroundColor: "#ddd",
  },
  modalOptionText: {
    fontSize: 18,
  },
  modalOptionTextSelected: {
    fontWeight: "bold",
  },
  modalCloseButton: {
    padding: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 18,
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
