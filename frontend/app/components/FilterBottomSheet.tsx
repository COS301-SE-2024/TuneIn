import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	PanResponder,
	Animated,
	ScrollView,
	Switch,
    Modal,
} from "react-native";
import axios from "axios";
import auth from "../services/AuthManagement";
import * as utils from "../services/Utils";
import ToggleButton from "./ToggleButton";
import Dropdown from "./Dropdown";
import { colors } from "../styles/colors";

interface BottomSheetProps {
	filter: string;
	explicit?: boolean;
	nsfw?: boolean;
	temporary?: boolean;
	isPrivate?: boolean;
	scheduled?: boolean;
	showMoreFilters: boolean;
	host?: string;
	roomCount?: string;
	maxFollowers?: string;
	minFollowers?: string;
	selectedGenre?: string | null;
	selectedLanguage?: string | null;
	setExplicit?: (value: boolean) => void;
	setNsfw?: (value: boolean) => void;
	setTemporary?: (value: boolean) => void;
	setIsPrivate?: (value: boolean) => void;
	setScheduled?: (value: boolean) => void;
	setHost?: (value: string) => void;
	setRoomCount?: (value: string) => void;
	setMaxFollowers?: (value: string) => void;
	setMinFollowers?: (value: string) => void;
	setSelectedGenre?: (value: string | null) => void;
	setSelectedLanguage?: (value: string | null) => void;
	handleSelectGenre?: (value: string) => void;
	handleSelectLanguage?: (value: string) => void;
	setShowMoreFilters: (value: boolean) => void;
}

// Define the functional component with default values set in the parameters
const FilterBottomSheet: React.FC<BottomSheetProps> = ({
	setExplicit = () => {},
	setNsfw = () => {},
	setTemporary = () => {},
	setIsPrivate = () => {},
	setScheduled = () => {},
	setHost = () => {},
	setRoomCount = () => {},
	setMaxFollowers = () => {},
	setMinFollowers = () => {},
	setSelectedGenre = () => {},
	setSelectedLanguage = () => {},
	handleSelectGenre = () => {},
	handleSelectLanguage = () => {},
    setShowMoreFilters = () => {},
	filter,
	explicit = false,
	nsfw = false,
	temporary = false,
	isPrivate = false,
	scheduled = false,
	showMoreFilters = true,
	host = "",
	roomCount = "",
	maxFollowers = "",
	minFollowers = "",
	selectedGenre = null,
	selectedLanguage = null,
}) => {
	const animation = useRef(new Animated.Value(50)).current; // Adjust initial translateY here

	 const [genres, setGenres] = useState([
			"rock",
			"pop",
			"jazz",
			"classical",
			"hip hop",
			"country",
			"electronica",
			"reggae",
			"blues",
			"folk",
			"metal",
			"punk",
			"soul",
			"r&b",
			"funk",
			"dancehall",
			"techno",
			"ambient",
			"gospel",
			"latin",
			"reggaeton",
			"ska",
			"opera",
		]);

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

	useEffect(() => {
		getGenres();
		console.log("Genre effect called");
	}, []);

	const getGenres = async () => {
		try {
			const token = await auth.getToken();

			if (token) {
				const response = await axios.get(`${utils.API_BASE_URL}/genres`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				setGenres(response.data);
			}
		} catch (error) {
			console.error("Error fetching genres:", error);
		}
	};

	useEffect(() => {
		setShowMoreFilters(showMoreFilters); // Update visibility state when prop changes
	}, [showMoreFilters]);

	const [panResponder] = useState(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderMove: Animated.event([null, { dy: animation }], {
				useNativeDriver: false,
				listener: (evt, gestureState) => {
					if (gestureState.dy > 0) {
						// Allow dragging only downwards
						if (gestureState.dy < 300) {
							// limit the maximum peeking height
							animation.setValue(gestureState.dy);
						}
					}
				},
			}),
			onPanResponderRelease: (evt, gestureState) => {
				if (gestureState.dy > 20) {
					setShowMoreFilters(false); 
				} else {
					Animated.spring(animation, {
						toValue: 0,
						useNativeDriver: false,
					}).start();
				}
			},
		}),
	);

	return (
		<Modal
			transparent={true}
			animationType="slide"
			visible={showMoreFilters}
		>
			<View style={styles.modalContainer}>
				<Animated.View
					style={[styles.modal, { transform: [{ translateY: animation }] }]}
				>
					<View style={styles.dragHandle} {...panResponder.panHandlers} />
					{(!filter ||
						(filter === "user") ||
						(filter === "room")) && (
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
												onValueChange={setExplicit}
											/>
										</View>
										<View style={styles.switchContainer}>
											<Text style={styles.switchLabel}>NSFW</Text>
											<Switch
												testID="nsfw-switch"
												value={nsfw}
												onValueChange={setNsfw}
											/>
										</View>
									</View>
									<View style={styles.dropContainer}>
										<Dropdown
											options={genres}
											placeholder="Select Genre"
											onSelect={setSelectedGenre}
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
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	modal: {
		backgroundColor: "white",
		padding: 20,
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		alignItems: "center",
		width: "100%",
		minHeight: "30%", // Adjust the minimum height here
	},
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
	// modalContainer: {
	// 	flex: 1,
	// 	justifyContent: "center",
	// 	alignItems: "center",
	// 	backgroundColor: "rgba(0, 0, 0, 0.5)",
	// },
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
	dragHandle: {
		width: 60,
		height: 5,
		backgroundColor: "#ccc",
		borderRadius: 5,
		marginBottom: 10,
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

export default FilterBottomSheet;
