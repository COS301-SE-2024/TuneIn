import React, { useState, useCallback, useRef, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	Animated,
	StyleSheet,
	NativeScrollEvent,
	NativeSyntheticEvent,
	Switch,
	ScrollView,
	FlatList,
} from "react-native";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RoomCardWidget from "../../components/rooms/RoomCardWidget";
import UserItem from "../../components/UserItem";
import FavoriteSongs from "../../components/FavoriteSong";
import { colors } from "../../styles/colors";
import { color } from "react-native-elements/dist/helpers";

const Search: React.FC = () => {
	const router = useRouter();
	const params = useLocalSearchParams();
	const items = Array.isArray(params.items)
		? JSON.parse(params.items[0])
		: JSON.parse(params.items);

	console.log("More Page: " + items);

	const navigation = useNavigation();
	const [scrollY] = useState(new Animated.Value(0));
	const previousScrollY = useRef(0);
	const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
	// const [displayedItems, setDisplayedItems] = useState(items.slice(0, 5)); // Initial load of 20 items
	const [loadingMore, setLoadingMore] = useState(false);
	const [currentPage, setCurrentPage] = useState(0);
	const flatListRef = useRef<FlatList<any>>(null);

	const ITEMS_PER_PAGE = 10;

	const handleScroll = useCallback(
		({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
			const currentOffset = nativeEvent.contentOffset.y;
			const direction = currentOffset > previousScrollY.current ? "down" : "up";
			previousScrollY.current = currentOffset;

			if (scrollTimeout.current) {
				clearTimeout(scrollTimeout.current);
			}

			scrollTimeout.current = setTimeout(() => {
				if (currentOffset <= 0 || direction === "up") {
					scrollY.setValue(0);
				} else {
					scrollY.setValue(100);
				}
			}, 50);
		},
		[scrollY],
	);

	const navBarTranslateY = scrollY.interpolate({
		inputRange: [0, 100],
		outputRange: [0, 100],
		extrapolate: "clamp",
	});

	// const loadMoreItems = () => {
	// 	if (!loadingMore) {
	// 		setLoadingMore(true);
	// 		const newItems = items.slice(
	// 			displayedItems.length,
	// 			displayedItems.length + 20,
	// 		);
	// 		setDisplayedItems((prevItems: any) => [...prevItems, ...newItems]);
	// 		setLoadingMore(false);
	// 	}
	// };

	const renderResult = ({ item }: { item: any }) => {
		console.log("Render Items: " + item);
		if (params.type === "room") {
			// console.log("Render Called");
			return (
				<View style={styles.roomCardPadding}>
					<RoomCardWidget roomCard={item} />
				</View>
			);
		}

		if (params.type === "song") {
			return (
				<FavoriteSongs
					key={item.id}
					songTitle={item.title}
					artist={item.artists}
					duration={item.duration}
					albumArt={item.cover}
					onPress={() => {}}
				/>
			);
		}
		return null;
	};

	const startIndex = currentPage * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const displayedItems = items.slice(startIndex, endIndex);

	const goToNextPage = () => {
		if (endIndex < items.length) {
			setCurrentPage(currentPage + 1);
			flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
		}
	};

	const goToPreviousPage = () => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
			flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
		}
	};

	const renderFooter = () => {
		if (items.length <= ITEMS_PER_PAGE) {
			// If there aren't enough items, don't show the pagination buttons
			return null;
		}

		return (
			<View style={styles.paginationContainer}>
				<TouchableOpacity
					style={[
						styles.paginationButton,
						currentPage === 0 && styles.disabledButton,
					]}
					onPress={goToPreviousPage}
					disabled={currentPage === 0}
				>
					<Ionicons
						name="chevron-back"
						size={30}
						color={currentPage === 0 ? colors.lightGray : "#000"}
					/>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.paginationButton,
						endIndex >= items.length && styles.disabledButton,
					]}
					onPress={goToNextPage}
					disabled={endIndex >= items.length}
				>
					<Ionicons
						name="chevron-forward"
						size={30}
						color={endIndex >= items.length ? colors.lightGray : "#000"}
					/>
				</TouchableOpacity>
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					testID="back-button"
				>
					<Ionicons name="chevron-back" size={30} color="black" />
				</TouchableOpacity>
				<Text style={styles.title}>{params.title}</Text>
			</View>
			<FlatList
				ref={flatListRef}
				data={displayedItems}
				renderItem={renderResult}
				contentContainerStyle={styles.resultsContainer}
				onScroll={handleScroll}
				ListFooterComponent={renderFooter}
			/>

			<Animated.View
				style={[
					styles.navBar,
					{ transform: [{ translateY: navBarTranslateY }] },
				]}
			></Animated.View>
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
		alignItems: "center",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
	noResult: {
		flex: 1, // Make the View take up the full screen
		alignItems: "center",
		justifyContent: "center",
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
		borderRadius: 20,
		borderWidth: 1,
		borderColor: "#ccc",
	},
	filterMore: {
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
	activeFilterMore: {
		backgroundColor: colors.primary,
		borderColor: colors.primary,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 5.84,
		elevation: 5,
	},
	filterText: {
		color: "#333",
		fontWeight: "bold",
		textAlign: "center",
	},
	selectedFiltersContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
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
		borderColor: colors.lightGray,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	selectedFilterText: {
		marginRight: 5,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		width: "60%",
		backgroundColor: "white",
		borderRadius: 10,
		padding: 20,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 20,
		marginBottom: 20,
		fontWeight: "bold",
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
	navBar: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 10,
	},
	resultsContainer: {
		paddingVertical: 10,
	},
	additionalFilters: {
		paddingHorizontal: 20,
		marginTop: 10,
		marginBottom: 40,
		height: "100%",
	},
	includeSection: {
		paddingVertical: 10,
	},
	includeHeader: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 5,
	},
	switchContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 5,
	},
	switchLabel: {
		fontSize: 16,
	},
	datePickerContainer: {
		paddingVertical: 10,
	},
	datePickerLabel: {
		fontSize: 16,
	},
	participantCountContainer: {
		paddingVertical: 10,
	},
	participantCountLabel: {
		fontSize: 16,
	},
	participantCountInput: {
		height: 40,
		borderColor: "gray",
		borderWidth: 1,
		borderRadius: 10,
		paddingHorizontal: 10,
	},
	dropContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingBottom: 10,
	},
	heading: {
		fontSize: 24,
		marginBottom: 20,
	},
	button: {
		backgroundColor: "#08BDBD",
		padding: 10,
		borderRadius: 5,
		marginTop: 10,
	},
	buttonText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "bold",
		textAlign: "center",
	},
	searchBy: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		paddingBottom: 10,
	},
	loadMoreButton: {
		width: 155,
		height: 37,
		backgroundColor: "rgba(158, 171, 184, 1)",
		borderRadius: 18.5,
		justifyContent: "center",
		alignItems: "center",
	},
	loadMoreText: {
		color: "#fff",
		fontSize: 16,
	},
	paginationContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 30,
		marginVertical: 20,
	},
	paginationButton: {
		padding: 10,
		justifyContent: "center",
		alignItems: "center",
	},
	disabledButton: {
		// You can keep this empty or adjust it if you need more specific styling for disabled buttons
	},
});

export default Search;
