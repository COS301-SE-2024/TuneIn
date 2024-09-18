import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	PanResponder,
	Animated,
	Switch,
	Modal,
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
							// Limit the maximum peeking height
							animation.setValue(gestureState.dy);
						}
					}
				},
			}),
			onPanResponderRelease: (evt, gestureState) => {
				if (gestureState.dy > 100) {
					// If dragged sufficiently, close the modal
					Animated.timing(animation, {
						toValue: 300, // Animate to the closed position
						duration: 300,
						useNativeDriver: false,
					}).start(() => {
						setShowMoreFilters(false); // Close the modal after animation
					});
				} else {
					// Otherwise, snap back to the open position
					Animated.spring(animation, {
						toValue: 0, // Fully open position
						useNativeDriver: false,
					}).start();
				}
			},
		}),
	);

	// Reset animation when modal is opened or closed
	useEffect(() => {
		if (showMoreFilters) {
			// When modal is opened, reset animation to open position
			Animated.timing(animation, {
				toValue: 0, // Fully open position
				duration: 300,
				useNativeDriver: false,
			}).start();
		} else {
			// When modal is closed, reset animation to closed position
			animation.setValue(300); // Move the sheet off-screen
		}
	}, [showMoreFilters]);

	return (
		<Modal transparent={true} animationType="slide" visible={showMoreFilters}>
			<View style={styles.modalContainer}>
				<Animated.View
					style={[styles.modal, { transform: [{ translateY: animation }] }]}
				>
					<View style={styles.dragHandleContainer}>
						<View style={styles.dragHandle} {...panResponder.panHandlers} />
					</View>
					{(!filter || filter === "user" || filter === "room") && (
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
								<View style={styles.additionalFilters}>
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
								</View>
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
		width: "100%",
		minHeight: "30%", // Adjust the minimum height here
	},
	dragHandle: {
		width: 60,
		height: 5,
		backgroundColor: "#ccc",
		borderRadius: 5,
		marginBottom: 10,
	},
	dragHandleContainer: {
		alignItems: "center", // Ensures the drag handle is centered horizontally
		marginBottom: 10,
	},
	additionalFilters: {
		paddingHorizontal: 20,
		marginTop: 10,
		marginBottom: 40,
		flexGrow: 1,
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
	dropContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingBottom: 10,
	},
	searchBy: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingBottom: 10,
		alignItems: "center", // Ensures the ToggleButtons align vertically in the center
		width: "100%", // Ensure it takes full width
	},
});

export default FilterBottomSheet;
