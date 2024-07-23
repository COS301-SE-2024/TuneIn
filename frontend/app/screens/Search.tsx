// AllFriends.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "expo-router";

const Search: React.FC = () => {
	const navigation = useNavigation();

	const goBack = () => {
		navigation.goBack();
	};

	return (
		<View className="flex-1 justify-center pt-4 px-4">
			<Text className="text-2xl font-bold text-gray-800 mt-2 mb-2">
				Welcome to the Search Page
			</Text>
			<TouchableOpacity onPress={goBack}>
				<Text>Go Back</Text>
			</TouchableOpacity>
		</View>
	);
};

export default Search;


// import React, { useState } from "react";
// import { View, TextInput, FlatList, StyleSheet, Text, TouchableOpacity } from "react-native";
// import RoomCard from "./RoomCard";
// import UserCard from "./UserCard"; // You will create this component next
// import { globalStyles } from "./styles/globalStyles";
// import { colors } from "./styles/colors";

// const SearchScreen: React.FC = () => {
//   const [searchText, setSearchText] = useState("");
//   const [filter, setFilter] = useState("rooms"); // "rooms" or "users"
//   const [results, setResults] = useState([]); // Replace with actual data

//   const handleSearch = () => {
//     // Implement your search logic here and update results
//   };

//   const renderCard = ({ item }) => {
//     if (filter === "rooms") {
//       return <RoomCard {...item} />;
//     } else {
//       return <UserCard {...item} />;
//     }
//   };

//   return (
//     <View style={globalStyles.container}>
//       <TextInput
//         style={styles.searchInput}
//         placeholder="Search..."
//         value={searchText}
//         onChangeText={setSearchText}
//         onSubmitEditing={handleSearch}
//       />
//       <View style={styles.filterContainer}>
//         <TouchableOpacity
//           style={[styles.filterButton, filter === "rooms" && styles.activeFilterButton]}
//           onPress={() => setFilter("rooms")}
//         >
//           <Text style={styles.filterButtonText}>Rooms</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           style={[styles.filterButton, filter === "users" && styles.activeFilterButton]}
//           onPress={() => setFilter("users")}
//         >
//           <Text style={styles.filterButtonText}>Users</Text>
//         </TouchableOpacity>
//         {/* Add more filters as needed */}
//       </View>
//       <FlatList
//         data={results}
//         renderItem={renderCard}
//         keyExtractor={(item) => item.id.toString()}
//         contentContainerStyle={styles.resultsContainer}
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   searchInput: {
//     height: 40,
//     borderColor: colors.secondary,
//     borderWidth: 1,
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     marginBottom: 20,
//   },
//   filterContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginBottom: 20,
//   },
//   filterButton: {
//     padding: 10,
//     borderRadius: 20,
//     backgroundColor: colors.secondary,
//   },
//   activeFilterButton: {
//     backgroundColor: colors.primary,
//   },
//   filterButtonText: {
//     color: "#fff",
//   },
//   resultsContainer: {
//     paddingBottom: 20,
//   },
// });

// export default SearchScreen;

