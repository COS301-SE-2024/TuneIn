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
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import RoomCardWidget from "../components/rooms/RoomCardWidget";
import UserItem from "../components/UserItem";
import { colors } from "../styles/colors";
import { Room } from "../models/Room";
import { User } from "../models/user";
import axios from "axios";
import auth from "../services/AuthManagement";
import * as utils from "../services/Utils";
import Dropdown from "../components/Dropdown";
import { SearchHistoryDto } from "../models/SearchHistoryDto";
// import DatePicker from "../components/DatePicker";
// import DateTimePicker from "@react-native-community/datetimepicker";
import ToggleButton from "../components/ToggleButton";
import SkeletonRoomCard from "../components/rooms/SkeletonRoomCard";
import SkeletonUserItem from "../components/SkeletonUserItem";
import SearchWithDropdown from "../components/SearchWithDropDown";

type SearchResult = {
	id: string;
	type: "room" | "user";
	name: string;
	roomData?: Room;
	userData?: User;
};

const roomFilterCategories = [
	{ id: "roomName", label: "Room Name" },
	{ id: "username", label: "Host" },
	{ id: "participationCount", label: "Participation Count" },
	{ id: "description", label: "Description" },
	{ id: "isTemporary", label: "Temporary" },
	{ id: "isPrivate", label: "Private" },
	{ id: "isScheduled", label: "Scheduled" },
	{ id: "startDate", label: "Start Date" },
	//   { id: 'endDate', label: 'End Date' },
	{ id: "language", label: "Language" },
	{ id: "explicit", label: "Explicit" },
	{ id: "nsfw", label: "NSFW" },
	{ id: "tags", label: "Tags" },
];
// Sample genre data with additional genres
let genres: string[] = [
	"Rock",
	"Pop",
	"Jazz",
	"Classical",
	"Hip Hop",
	"Country",
	"Electronic",
	"Reggae",
	"Blues",
	"Folk",
	"Metal",
	"Punk",
	"Soul",
	"R&B",
	"Funk",
	"Alternative",
	"Indie",
	"Dance",
	"Techno",
	"Ambient",
	"Gospel",
	"Latin",
	"Reggaeton",
	"Ska",
	"Opera",
];

// Sample language data
const languages = [
	"English",
	"Spanish",
	"French",
	"German",
	"Chinese",
	"Japanese",
	"Korean",
	"Portuguese",
	"Russian",
	"Arabic",
	"Italian",
	"Turkish",
	"Swedish",
];

const Search: React.FC = () => {
	const navigation = useNavigation();
	const [searchTerm, setSearchTerm] = useState("");
	// const [filter, setFilter] = useState<"all" | "room" | "user">("all");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [scrollY] = useState(new Animated.Value(0));
	const previousScrollY = useRef(0);
	const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
	const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
	const [filter, setFilter] = useState("room"); // Default to "room"
	const [showMoreFilters, setShowMoreFilters] = useState(false);
	const [filtersOn, setFiltersOn] = useState(false);
	const [explicit, setExplicit] = useState(false);
	const [nsfw, setNsfw] = useState(false);
	const [loading, setLoading] = useState(true);
	// const [startDate, setStartDate] = useState(null);
	// const [endDate, setEndDate] = useState(null);
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
	// const [showStartDateModal, setShowStartDateModal] = useState(false);
	// const [showEndDateModal, setShowEndDateModal] = useState(false);

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
				console.log("Recommendations token: " + token);
				console.log("Base url: " + utils.API_BASE_URL);
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
				console.error("Error fetching recommended rooms:", error);
			}
			setLoading(false);
		};
		if (searchTerm === "") {
			if (filter === "room") {
				setSearchSuggestions(roomSearchHistory.slice(0, 5));
				getRecommendedRooms();
			} else if (filter === "user") {
				setSearchSuggestions(userSearchHistory.slice(0, 5));
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
			}, 500);
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
		const advanced = isAdvancedSearch();
		console.log("Search Filter: " + filter);
		setDropdownVisible(false);
		setLoading(true);
		try {
			const token = await auth.getToken();

			if (token) {
				if (filter === "all") {
					const response = await axios.get(
						`${utils.API_BASE_URL}/search?q=${sh}`,
						{
							headers: {
								Authorization: `Bearer ${token}`,
							},
						},
					);
					// console.log("Search: " + JSON.stringify(response));
					const results: SearchResult[] = response.data.rooms.map(
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

					const users: SearchResult[] = response.data.users.map(
						(item: any) => ({
							id: item.id,
							type: "user",
							name: item.username,
							userData: {
								id: item.id,
								profile_picture_url: item.profile_picture_url,
								profile_name: item.profile_name,
								username: item.username,
							},
						}),
					);

					const combinedResult = results.concat(users);

					// console.log("Formatted results: " + JSON.stringify(results));
					setResults(combinedResult);
				} else if (filter === "room") {
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

						console.log("Request: " + request);
						// console.log("Search: " + JSON.stringify(response));
						const results: SearchResult[] = response.data.map((item: any) => ({
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
						}));

						setResults(results);
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
						// console.log("Results: " + JSON.stringify(results));
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
						// console.log("Search: " + JSON.stringify(response));
						const results: SearchResult[] = response.data.map((item: any) => ({
							id: item.id,
							type: "user",
							name: item.username,
							userData: {
								id: item.id,
								profile_picture_url: item.profile_picture_url,
								profile_name: item.profile_name,
								username: item.username,
							},
						}));
						setResults(results);
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
						// console.log("Search: " + JSON.stringify(response.data.followers));
						const results: SearchResult[] = response.data.map((item: any) => ({
							id: item.id,
							type: "user",
							name: item.username,
							userData: {
								id: item.id,
								profile_picture_url: item.profile_picture_url,
								profile_name: item.profile_name,
								username: item.username,
								followers: item.followers.data,
							},
						}));
						setResults(results);
					}
				}
			}
		} catch (error) {
			console.error("Error fetching search info:", error);
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

	const navBarTranslateY = scrollY.interpolate({
		inputRange: [0, 100],
		outputRange: [0, 100],
		extrapolate: "clamp",
	});

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

	const getHistory = async () => {
		try {
			const token = await auth.getToken();

			if (token) {
				const roomHistResp = await axios.get(
					`${utils.API_BASE_URL}/search/rooms/history`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const roomHistTerms = roomHistResp.data.map(
					(search: SearchHistoryDto) => search.search_term,
				);
				setRoomSearchHistory(roomHistTerms);
				console.log("Room history: " + roomHistTerms);

				const userHistResp = await axios.get(
					`${utils.API_BASE_URL}/search/users/history`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					},
				);

				const userHistTerms = userHistResp.data.map(
					(search: SearchHistoryDto) => search.search_term,
				);
				setUserSearchHistory(userHistTerms);
			}
		} catch (error) {
			console.error("Error fetching search history:", error);
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
			console.error("Error fetching search history:", error);
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
			console.error("Error fetching search history:", error);
			return null;
		}
	};

	useEffect(() => {
		// Check if the filter has changed and if the searchTerm is not empty
		if (prevFilterRef.current !== filter && searchTerm !== "") {
			handleSearch();
		}

		if (filter === "room") {
			setSearchSuggestions(roomSearchHistory.slice(0, 5));
		} else {
			setSearchSuggestions(userSearchHistory.slice(0, 5));
		}

		// Update the previous filter ref to the current filter
		prevFilterRef.current = filter;
	}, [filter]);

	const getGenres = async () => {
		try {
			const token = await auth.getToken();

			if (token) {
				const response = await axios.get(`${utils.API_BASE_URL}/genres`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				// console.log("Genre data" + response.data);
				genres = response.data;
			}
		} catch (error) {
			console.error("Error fetching genres:", error);
		}
	};

	useEffect(() => {
		getGenres();
		getHistory();
	}, []);

	const handleSelectGenre = (genre: string) => {
		setSelectedGenre(genre);
	};

	const handleSelectLanguage = (language: string) => {
		setSelectedLanguage(language);
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
				<Text style={styles.title}>Search </Text>
			</View>
			<View style={styles.searchBarContainer}>
				<TextInput
					testID="search-input"
					style={styles.searchBar}
					placeholder="Search..."
					value={searchTerm}
					onBlur={() => {setTimeout(() => {setDropdownVisible(false);}, 200)}}
					onFocus={() => setDropdownVisible(true)}
					onChangeText={setSearchTerm}
				/>
				<TouchableOpacity
					style={styles.searchIcon}
					onPress={() => {
						handleSearch();
						getHistory();
					}}
					testID="search-button"
				>
					<Ionicons name="search-sharp" size={30} color={colors.primary} />
				</TouchableOpacity>
			</View>
			{dropdownVisible && (
				<FlatList
					data={searchSuggestions}
					keyExtractor={(item) => item}
					renderItem={({ item }) => (
						<TouchableOpacity
						style={styles.dropdownItem}
							onPress={() => {
								console.log("selected: " + item)
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
					<Text style={styles.filterText}>
						{showMoreFilters ? "View Less Filters" : "View More Filters"}
					</Text>
				</TouchableOpacity>
			</View>

			{(!filter ||
				(filter === "user" && showMoreFilters) ||
				(filter === "room" && showMoreFilters)) && (
				<>
					{(filter === "user" || !filter) && (
						<View style={styles.additionalFilters}>
							{showMoreFilters && (
								<View style={styles.includeSection}>
									<Text style={styles.includeHeader}>Search by:</Text>
									<View style={styles.searchBy}>
										<ToggleButton
											label="Minimum Followers"
											value={minFollowers}
											onValueChange={setMinFollowers}
											testID="minFol-btn"
										/>
										<ToggleButton
											label="Minimum Following"
											value={maxFollowers}
											onValueChange={setMaxFollowers}
											testID="maxFl-btn"
										/>
									</View>
								</View>
							)}
						</View>
					)}

					{(filter === "room" || !filter) && (
						<ScrollView style={styles.additionalFilters}>
							<View style={styles.includeSection}>
								<Text style={styles.includeHeader}>Search by:</Text>
								<View style={styles.searchBy}>
									<ToggleButton
										label="Host"
										testID="host-toggle"
										value={host}
										onValueChange={setHost}
									/>
									<ToggleButton
										label="Room Count"
										testID="room-count-toggle"
										value={roomCount}
										onValueChange={setRoomCount}
									/>
								</View>
							</View>
							<View style={styles.includeSection}>
								<Text style={styles.includeHeader}>Include:</Text>
								<View style={styles.switchContainer}>
									<Text style={styles.switchLabel}>Explicit</Text>
									<Switch
										testID="explicit-switch"
										value={explicit}
										onValueChange={(value) => setExplicit(value)}
									/>
								</View>
								<View style={styles.switchContainer}>
									<Text style={styles.switchLabel}>NSFW</Text>
									<Switch
										testID="nsfw-switch"
										value={nsfw}
										onValueChange={(value) => setNsfw(value)}
									/>
								</View>
							</View>
							<View style={styles.dropContainer}>
								<Dropdown
									options={genres}
									placeholder="Select Genre"
									onSelect={handleSelectGenre}
									selectedOption={selectedGenre}
									setSelectedOption={setSelectedGenre}
								/>
								<Dropdown
									options={languages}
									placeholder="Select Language"
									onSelect={handleSelectLanguage}
									selectedOption={selectedLanguage}
									setSelectedOption={setSelectedLanguage}
								/>
							</View>
							{/* <Text style={styles.includeHeader}>Room Availability:</Text>
							<View style={styles.datePickerContainer}>
								<Text style={styles.datePickerLabel}>Start Date:</Text>
								<DatePicker selectedOption={startDate} onPress={() => setShowStartDateModal(!showStartDateModal)}></DatePicker>
								{showStartDateModal && <DateTimePicker
									value={startDate || new Date()}
									mode="datetime"
									display="default"
									onChange={(event, selectedDate) =>{
										setStartDate(selectedDate || undefined)
										setShowStartDateModal(false);
									}
									}
								/>}
							</View>
							<View style={styles.datePickerContainer}>
								<Text style={styles.datePickerLabel}>End Date:</Text>
								<DatePicker selectedOption={startDate} onPress={() => setShowEndDateModal(!showEndDateModal)}></DatePicker>
								{showEndDateModal && <DateTimePicker
									value={endDate || new Date()}
									mode="datetime"
									display="default"
									onChange={(event, selectedDate) =>{
										setEndDate(selectedDate || undefined);
										setShowEndDateModal(false);
									}}
								/>}
							</View> */}
							<View style={styles.includeSection}>
								<Text style={styles.includeHeader}>Other:</Text>
								<View style={styles.switchContainer}>
									<Text style={styles.switchLabel}>Temporary</Text>
									<Switch
										value={temporary}
										onValueChange={setTemporary}
										testID="temp-switch"
									/>
								</View>
								<View style={styles.switchContainer}>
									<Text style={styles.switchLabel}>Private</Text>
									<Switch
										value={isPrivate}
										onValueChange={setIsPrivate}
										testID="priv-switch"
									/>
								</View>
								<View style={styles.switchContainer}>
									<Text style={styles.switchLabel}>Scheduled</Text>
									<Switch
										value={scheduled}
										onValueChange={setScheduled}
										testID="scheduled-switch"
									/>
								</View>
							</View>
						</ScrollView>
					)}
				</>
			)}

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
					<Text>No results found</Text>
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
	dropdown: {
		position: "absolute",
		top: 125,
		width: "85%",
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
