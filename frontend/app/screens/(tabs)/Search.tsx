import React, { useState, useCallback, useRef, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	Animated,
	StyleSheet,
	NativeScrollEvent,
	NativeSyntheticEvent,
	FlatList,
} from "react-native";
import { GestureHandlerRootView, TouchableOpacity } from "react-native-gesture-handler";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RoomCardWidget from "../../components/rooms/RoomCardWidget";
import UserItem from "../../components/UserItem";
import { colors } from "../../styles/colors";
import { Room } from "../../models/Room";
import { User } from "../../models/user";
import axios from "axios";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { SearchHistoryDto } from "../../models/SearchHistoryDto";
import SkeletonRoomCard from "../../components/rooms/SkeletonRoomCard";
import SkeletonUserItem from "../../components/SkeletonUserItem";
import FilterBottomSheet from "../../components/FilterBottomSheet";

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
	const [results, setResults] = useState<SearchResult[]>([]);
	const [scrollY] = useState(new Animated.Value(0));
	const previousScrollY = useRef(0);
	const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
	const [filter, setFilter] = useState("room"); // Default to "room"
	const [showMoreFilters, setShowMoreFilters] = useState(false);
	const [explicit, setExplicit] = useState(false);
	const [nsfw, setNsfw] = useState(false);
	const [loading, setLoading] = useState(true);
	const [temporary, setTemporary] = useState(false);
	const [isPrivate, setIsPrivate] = useState(false);
	const [scheduled, setScheduled] = useState(false);
	const [host, setHost] = useState<string>("");
	const [roomCount, setRoomCount] = useState("");
	const [maxFollowers, setMaxFollowers] = useState("");
	const [minFollowers, setMinFollowers] = useState("");
	const prevFilterRef = useRef(filter);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const [userSearchHistory, setUserSearchHistory] = useState<string[]>([]);
	const [roomSearchHistory, setRoomSearchHistory] = useState<string[]>([]);
	const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
	const [searchError, setSearchError] = useState<boolean>(false);

	const isAdvancedSearch = () => {
		if (filter === "room") {
			if (nsfw) {
				return true;
			}
			if (explicit) {
				return true;
			}
			if (scheduled) {
				return true;
			}
			if (isPrivate) {
				return true;
			}
			if (temporary) {
				return true;
			}
			if (selectedGenre) {
				return true;
			}
			if (selectedLanguage) {
				return true;
			}
			if (host !== "") {
				return true;
			}
			if (roomCount !== "") {
				return true;
			}
		} else if (filter === "user") {
			if (minFollowers !== "") {
				return true;
			}
			if (maxFollowers !== "") {
				return true;
			}
		}

		return false;
	};

	useEffect(() => {
		const getRecommendedRooms = async () => {
			setLoading(true);
			try {
				const token = await auth.getToken();
				if (token) {
					const response = await axios.get(
						`${utils.API_BASE_URL}/users/rooms/foryou`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						},
					);
					const recommendedRooms: SearchResult[] = response.data.map(
						(item: any) => ({
							id: item.roomID,
							type: "room",
							name: item.room_name,
							roomData: {
								roomID: item.roomID,
								backgroundImage: item.room_image,
								name: item.room_name,
								description: item.description,
								userID: item.creator.userID,
								tags: item.tags,
							},
						}),
					);
					console.log("recommended rooms:", recommendedRooms);
					console.log("Recommended rooms length: " + recommendedRooms.length);
					setResults(recommendedRooms);
				}
			} catch (error) {
				console.log("Error fetching recommended rooms:", error);
			}
			setLoading(false);
		};

		if (searchTerm === "") {
			if (filter === "room") {
				getRoomHistory();
				getRecommendedRooms();
			} else if (filter === "user") {
				getUserHistory();
			}
		} else {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				if (filter === "room") {
					getRoomsSuggestions(searchTerm);
				} else if (filter === "user") {
					getUsersSuggestions(searchTerm);
				}
			}, 300);
		}
	}, [searchTerm]);

	useEffect(() => {
		if (searchTerm !== "") {
			handleSearch();
		}
	}, [
		nsfw,
		explicit,
		scheduled,
		isPrivate,
		temporary,
		selectedGenre,
		selectedLanguage,
		host,
		roomCount,
		minFollowers,
		maxFollowers,
	]);

	const handleSearch = async (sh: string = searchTerm) => {
		console.log("handle search genre: " + selectedGenre);
		const advanced = isAdvancedSearch();
		setDropdownVisible(false);
		setLoading(true);
		try {
			const token = await auth.getToken();

			if (token) {
				if (filter === "room") {
					if (advanced) {
						let request = `${utils.API_BASE_URL}/search/rooms/advanced?q=${sh}`;
						if (nsfw) {
							request += `&nsfw=${nsfw}`;
						}
						if (explicit) {
							request += `&explicit=${explicit}`;
						}
						if (scheduled) {
							request += `&is_scheduled=${scheduled}`;
						}
						if (isPrivate) {
							request += `&is_priv=${isPrivate}`;
						}
						if (temporary) {
							request += `&is_temporary=${temporary}`;
						}
						if (selectedGenre) {
							request += `&tags=${selectedGenre}`;
						}
						if (selectedLanguage) {
							request += `&lang=${selectedLanguage}`;
						}
						if (host !== "") {
							request += `&creator_username=${host}`;
						}
						if (roomCount !== "") {
							request += `&participant_count=${roomCount}`;
						}
						const response = await axios.get(request, {
							headers: {
								Authorization: `Bearer ${token}`,
							},
						});

						console.log("Advance Room Search: " + JSON.stringify(response));
						const roomResults: SearchResult[] = response.data.map(
							(item: any) => ({
								id: item.roomID,
								type: "room",
								name: item.room_name,
								roomData: {
									roomID: item.roomID,
									backgroundImage: item.room_image,
									name: item.room_name,
									description: item.description,
									userID: item.creator.userID,
									tags: item.tags,
									language: item.language,
									roomSize: item.participant_count,
									isExplicit: item.has_explicit_content,
									isNsfw: item.has_nsfw_content,
								},
							}),
						);

						setResults(roomResults);
					} else {
						const response = await axios.get(
							`${utils.API_BASE_URL}/search/rooms?q=${sh}`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
								},
							},
						);
						// console.log("Search: " + JSON.stringify(response));
						const formatResults: SearchResult[] = response.data.map(
							(item: any) => ({
								id: item.roomID,
								type: "room",
								name: item.room_name,
								roomData: {
									roomID: item.roomID,
									backgroundImage: item.room_image,
									name: item.room_name,
									description: item.description,
									userID: item.creator.userID,
									tags: item.tags,
									language: item.language,
									roomSize: item.participant_count,
									isExplicit: item.has_explicit_content,
									isNsfw: item.has_nsfw_content,
								},
							}),
						);

						setResults(formatResults);
					}
				} else if (filter === "user") {
					if (advanced) {
						let request = `${utils.API_BASE_URL}/search/users/advanced?q=${sh}`;

						if (minFollowers !== "") {
							request += `&following=${minFollowers}`;
						}
						if (maxFollowers !== "") {
							request += `&followers=${maxFollowers}`;
						}

						// console.log("Request: " + request);
						const response = await axios.get(request, {
							headers: {
								Authorization: `Bearer ${token}`,
							},
						});

						const userResults: SearchResult[] = response.data.map(
							(item: any) => ({
								id: item.userID,
								type: "user",
								name: item.username,
								userData: {
									id: item.userID,
									profile_picture_url: item.profile_picture_url,
									profile_name: item.profile_name,
									username: item.username,
									followers: item.followers.data,
								},
							}),
						);
						setResults(userResults);
						// setShowMoreFilters(false);
					} else {
						const response = await axios.get(
							`${utils.API_BASE_URL}/search/users?q=${sh}`,
							{
								headers: {
									Authorization: `Bearer ${token}`,
								},
							},
						);
						// console.log("Search: " + JSON.stringify(response.data));
						const userResults: SearchResult[] = response.data.map(
							(item: any) => ({
								id: item.userID,
								type: "user",
								name: item.username,
								userData: {
									id: item.userID,
									profile_picture_url: item.profile_picture_url,
									profile_name: item.profile_name,
									username: item.username,
									followers: item.followers.data,
								},
							}),
						);
						setResults(userResults);
					}
				}

				setSearchError(false);
			}
		} catch (error) {
			console.log("Error fetching search info:", error);
			setResults([]);
			setSearchError(true);
			setLoading(false);
			return null;
		}
		setLoading(false);
	};

	const handleScroll = useCallback(
		({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
			const currentOffset = nativeEvent.contentOffset.y;
			const direction = currentOffset > previousScrollY.current ? "down" : "up";
			previousScrollY.current = currentOffset;

			if (scrollTimeout.current) {
				clearTimeout(scrollTimeout.current);
			}

			scrollTimeout.current = setTimeout(() => {
				// Simplify for testing purposes if needed
				if (currentOffset <= 0 || direction === "up") {
					scrollY.setValue(0);
				} else {
					scrollY.setValue(100);
				}
			}, 50);
		},
		[scrollY],
	);

	const renderResult = ({ item }: { item: SearchResult }) => {
		if (item.type === "room" && item.roomData) {
			// console.log("Render Called");
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

	const handleToggleMoreFilters = () => {
		setShowMoreFilters(!showMoreFilters);
	};

	const handleSelection = (selectedFilter: string) => {
		setFilter(selectedFilter);
	};

	const getRoomHistory = async () => {
		try {
			const token = await auth.getToken();

			if (token) {
				const response = await axios.get(
					`${utils.API_BASE_URL}/search/rooms/history`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const roomHistTerms = response.data.map(
					(search: SearchHistoryDto) => search.search_term,
				);
				setRoomSearchHistory(roomHistTerms);
				setSearchSuggestions(roomHistTerms.slice(0, 5));
			}
		} catch (error) {
			console.log("Error fetching search history:", error);
			return null;
		}
	};

	const getUserHistory = async () => {
		try {
			const token = await auth.getToken();

			if (token) {
				const response = await axios.get(
					`${utils.API_BASE_URL}/search/users/history`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const userHistTerms = response.data.map(
					(search: SearchHistoryDto) => search.search_term,
				);
				setUserSearchHistory(userHistTerms);
				setSearchSuggestions(userHistTerms.slice(0, 5));
			}
		} catch (error) {
			console.log("Error fetching search history:", error);
			return null;
		}
	};

	const getRoomsSuggestions = async (q: string) => {
		try {
			const token = await auth.getToken();

			if (token) {
				const response = await axios.get(
					`${utils.API_BASE_URL}/search/rooms/suggestions?q=${q}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const searchTerms = response.data.map(
					(search: SearchHistoryDto) => search.search_term,
				);
				setSearchSuggestions(searchTerms.slice(0, 5));
			}
		} catch (error) {
			console.log("Error fetching search history:", error);
			return null;
		}
	};

	const getUsersSuggestions = async (q: string) => {
		try {
			const token = await auth.getToken();

			if (token) {
				const response = await axios.get(
					`${utils.API_BASE_URL}/search/users/suggestions?q=${q}`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const searchTerms = response.data.map(
					(search: SearchHistoryDto) => search.search_term,
				);
				setSearchSuggestions(searchTerms.slice(0, 5));
			}
		} catch (error) {
			console.log("Error fetching search history:", error);
			return null;
		}
	};

	useEffect(() => {
		// Check if the filter has changed and if the searchTerm is not empty
		if (prevFilterRef.current !== filter && searchTerm !== "") {
			handleSearch();
		}

		if (filter === "room") {
			getRoomHistory();
		} else {
			getUserHistory();
		}

		// Update the previous filter ref to the current filter
		prevFilterRef.current = filter;
	}, [filter]);

	useEffect(() => {
		getRoomHistory();
	}, []);

	return (
		<GestureHandlerRootView>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity
						onPress={() => navigation.goBack()}
						testID="back-button"
					>
						<Ionicons name="chevron-back" size={30} color="black" />
					</TouchableOpacity>
					<Text style={styles.title}>Search </Text>
				</View>
				<View style={styles.searchBarContainer}>
					<TextInput
						testID="search-input"
						style={styles.searchBar}
						placeholder="Search..."
						value={searchTerm}
						onBlur={() => {
							setTimeout(() => {
								setDropdownVisible(false);
							}, 200);
						}}
						onFocus={() => {
							setDropdownVisible(true);
						}}
						onChangeText={setSearchTerm}
					/>
					<TouchableOpacity
						style={styles.searchIcon}
						onPress={() => {
							handleSearch();
						}}
						testID="search-button"
					>
						<Ionicons name="search-sharp" size={30} color={colors.primary} />
					</TouchableOpacity>
				</View>
				{dropdownVisible && searchSuggestions.length !== 0 && (
					<FlatList
						data={searchSuggestions}
						keyExtractor={(item) => item}
						renderItem={({ item }) => (
							<TouchableOpacity
								style={styles.dropdownItem}
								onPress={() => {
									setSearchTerm(item);
									handleSearch(item);
								}}
							>
								<Text style={styles.dropdownItemText}>{item}</Text>
							</TouchableOpacity>
						)}
						style={styles.dropdown}
					/>
				)}
				<View style={styles.filterContainer}>
					<TouchableOpacity
						style={[
							styles.filterButton,
							filter === "room" && styles.activeFilter,
						]}
						onPress={() => handleSelection("room")}
					>
						<Text style={styles.filterText}>Rooms</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={[
							styles.filterButton,
							filter === "user" && styles.activeFilter,
						]}
						onPress={() => handleSelection("user")}
						testID="user-btn"
					>
						<Text style={styles.filterText}>Users</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.filterButton}
						onPress={handleToggleMoreFilters}
						testID="toggle-filters-button"
					>
						<Text style={styles.filterText}>{"View More Filters"}</Text>
					</TouchableOpacity>
				</View>

				<FilterBottomSheet
					filter={filter}
					explicit={explicit}
					nsfw={nsfw}
					temporary={temporary}
					isPrivate={isPrivate}
					scheduled={scheduled}
					showMoreFilters={showMoreFilters}
					host={host}
					roomCount={roomCount}
					maxFollowers={maxFollowers}
					minFollowers={minFollowers}
					selectedGenre={selectedGenre}
					selectedLanguage={selectedLanguage}
					setExplicit={setExplicit}
					setNsfw={setNsfw}
					setTemporary={setTemporary}
					setIsPrivate={setIsPrivate}
					setScheduled={setScheduled}
					setHost={setHost}
					setRoomCount={setRoomCount}
					setMaxFollowers={setMaxFollowers}
					setMinFollowers={setMinFollowers}
					setSelectedGenre={setSelectedGenre}
					setSelectedLanguage={setSelectedLanguage}
					setShowMoreFilters={setShowMoreFilters}
				/>

				{loading ? (
					!showMoreFilters && (
						// Render Skeleton if loading
						<View style={styles.roomCardPadding}>
							{filter === "room" ? (
								<>
									<SkeletonRoomCard />
									<SkeletonRoomCard />
									<SkeletonRoomCard />
								</>
							) : (
								<>
									<SkeletonUserItem />
									<SkeletonUserItem />
									<SkeletonUserItem />
									<SkeletonUserItem />
									<SkeletonUserItem />
								</>
							)}
						</View>
					)
				) : results.length === 0 ? (
					// Render No Results Message if no results
					<View style={styles.noResult}>
						<Text>
							{searchError
								? "Failed to load search results"
								: "No results found"}
						</Text>
					</View>
				) : (
					// Render FlatList if there are results
					<FlatList
						data={results}
						keyExtractor={(item) => item.id}
						renderItem={renderResult}
						contentContainerStyle={styles.resultsContainer}
						onScroll={handleScroll}
					/>
				)}
			</View>
		</GestureHandlerRootView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 10,
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
	dropdown: {
		position: "absolute",
		top: 125,
		width: "100%",
		backgroundColor: "#f2f2f2",
		borderColor: "#ccc",
		borderWidth: 1,
		borderRadius: 5,
		maxHeight: 150, // Optional: limits the height of the dropdown
		zIndex: 1,
		shadowColor: "#000", // Adding shadow to match the 'selectedFilter' style
		shadowOffset: { width: 0, height: 4 }, // Matching shadow settings
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		paddingHorizontal: 10, // Adding padding to match general spacing
		marginLeft: 30,
	},
	searchContainer: {
		flex: 1,
		paddingHorizontal: 10,
		paddingTop: 50,
	},
	dropdownItem: {
		// paddingVertical: 5,
		paddingHorizontal: 15,
		borderBottomWidth: 5,
		borderBottomColor: "#eee",
		justifyContent: "center",
	},

	dropdownItemText: {
		fontSize: 16,
		color: "#333",
	},
});

export default Search;
