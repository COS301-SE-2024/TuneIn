import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	PanResponder,
	Animated,
	Switch,
	Modal,
	Easing,
	TouchableWithoutFeedback,
} from "react-native";
import axios from "axios";
import auth from "../services/AuthManagement";
import * as utils from "../services/Utils";
import ToggleButton from "./ToggleButton";
import Dropdown from "./Dropdown";

interface BottomSheetProps {
	filter: string;
	explicit?: boolean;
	nsfw?: boolean;
	temporary?: boolean;
	isPrivate?: boolean;
	scheduled?: boolean;
	showMoreFilters: boolean;
	host?: string;
	language?: string;
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
	language = "",
	roomCount = "",
	maxFollowers = "",
	minFollowers = "",
	selectedGenre = null,
	selectedLanguage = null,
}) => {
	// const animation = useRef(new Animated.Value(50)).current; // Adjust initial translateY here

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

	const slideAnim = useRef(new Animated.Value(300)).current;
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);

	useEffect(() => {
		if (showMoreFilters) {
			// Set modal visible state
			setIsModalVisible(true);

			// Animate the modal opening
			timeoutRef.current = setTimeout(() => {
				Animated.timing(slideAnim, {
					toValue: 0, // Fully visible
					duration: 300,
					easing: Easing.out(Easing.ease),
					useNativeDriver: true,
				}).start();
			}, 0);

			return () => {
				clearTimeout(timeoutRef.current!); // Clean up timeout
			};
		} else {
			// Animate the modal closing
			Animated.timing(slideAnim, {
				toValue: 300, // Slide down to hide
				duration: 300,
				easing: Easing.in(Easing.ease),
				useNativeDriver: true,
			}).start(() => {
				setShowMoreFilters(false); // Close modal after animation
				setIsModalVisible(false); // Update visibility state
			});
		}
	}, [showMoreFilters]);

	const handleClose = () => {
		if (isModalVisible) {
			// Check if modal is currently visible
			Animated.timing(slideAnim, {
				toValue: 300, // Slide down to hide
				duration: 300,
				easing: Easing.in(Easing.ease),
				useNativeDriver: true,
			}).start(() => setShowMoreFilters(false)); // Close modal after animation
		}
	};

	return (
		<Modal transparent={true} animationType="slide" visible={showMoreFilters}>
			<TouchableWithoutFeedback onPress={handleClose}>
				<View style={styles.modalContainer}>
					<View style={styles.modalOverlay}>
						<TouchableWithoutFeedback>
							<Animated.View
								style={[
									styles.modal,
									{
										transform: [{ translateY: slideAnim }],
									},
									filter === "room"
										? { minHeight: "30%" }
										: { minHeight: "20%" },
								]}
							>
								{(!filter || filter === "user" || filter === "room") && (
									<>
										{(filter === "user" || !filter) && (
											<View style={styles.additionalFilters}>
												{showMoreFilters && (
													<View style={styles.includeSection}>
														<Text style={styles.includeHeader}>Search by:</Text>
														<View style={[styles.searchBy, { paddingTop: 15 }]}>
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
											<View style={styles.additionalFilters}>
												<View style={styles.includeSection}>
													<Text
														style={[styles.includeHeader, { marginBottom: 10 }]}
													>
														Search by:
													</Text>
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
												<View style={styles.searchBy}>
													<ToggleButton
														label="Language"
														testID="language-toggle"
														value={language}
														onValueChange={setSelectedLanguage}
													/>
												</View>
												<View style={styles.searchBy}>
													<Dropdown
														options={genres}
														placeholder="Genre"
														onSelect={setSelectedGenre}
														selectedOption={selectedGenre}
														setSelectedOption={setSelectedGenre}
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
											</View>
										)}
									</>
								)}
							</Animated.View>
						</TouchableWithoutFeedback>
					</View>
				</View>
			</TouchableWithoutFeedback>
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
		width: "100%",
		minHeight: "30%", // Adjust the minimum height here
	},
	additionalFilters: {
		paddingHorizontal: 20,
		marginTop: 15,
		flexGrow: 1,
	},
	includeSection: {
		paddingVertical: 5,
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
	dropContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingBottom: 5,
	},
	searchBy: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center", // Ensures the ToggleButtons align vertically in the center
		width: "100%", // Ensure it takes full width
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
		justifyContent: "flex-end", // Align at the bottom
	},
});

export default FilterBottomSheet;
