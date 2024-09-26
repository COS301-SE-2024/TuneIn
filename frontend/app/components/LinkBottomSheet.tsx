import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	Animated,
	Modal,
	Easing,
	TouchableOpacity,
	TouchableWithoutFeedback,
	KeyboardAvoidingView,
	Platform,
	Linking,
} from "react-native";
import {
	GestureHandlerRootView,
	ScrollView,
} from "react-native-gesture-handler";
import { colors } from "../styles/colors";

interface LinkBottomSheetProps {
	links: any;
	isVisible: boolean;
	setIsVisible: (value: boolean) => void;
}

// Define the functional component with default values set in the parameters
const LinkBottomSheet: React.FC<LinkBottomSheetProps> = ({
	setIsVisible: setShowMoreFilters = () => {},
	isVisible: showMoreFilters = true,
	links,
}) => {
	const slideAnim = useRef(new Animated.Value(300)).current;
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const [isModalVisible, setIsModalVisible] = useState(false);
	console.log("");

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
			<GestureHandlerRootView>
				<TouchableWithoutFeedback onPress={handleClose}>
					<View style={styles.modalContainer} testID="link-bottom-sheet">
						<View style={styles.modalOverlay}>
							<KeyboardAvoidingView
								behavior={Platform.OS === "ios" ? "padding" : "height"}
							>
								<TouchableWithoutFeedback>
									<ScrollView>
										<Animated.View
											style={[
												styles.modal,
												{
													transform: [{ translateY: slideAnim }],
												},
												{ minHeight: "20%" },
											]}
										>
											<View
												style={{
													padding: 10,
													alignItems: "center",
													borderBottomWidth: 1,
													borderColor: "#ccc",
												}}
											>
												<Text
													style={{
														fontSize: 20,
														fontWeight: "bold",
														// color: "white",
													}}
												>
													Links
												</Text>
											</View>
											<View style={styles.textContainer}>
												{Object.keys(links).map((type, index) => (
													<Links
														key={index}
														mediaPlatform={type}
														links={links[type]}
													/>
												))}
											</View>
										</Animated.View>
									</ScrollView>
								</TouchableWithoutFeedback>
							</KeyboardAvoidingView>
						</View>
					</View>
				</TouchableWithoutFeedback>
			</GestureHandlerRootView>
		</Modal>
	);
};

const capitalizeFirstLetter = (string) => {
	return string.charAt(0).toUpperCase() + string.slice(1);
};

const Links = ({
	mediaPlatform,
	links,
	setIsVisible: setShowMoreFilters = (val: boolean) => {},
}) => {
	// console.log("Links: " + links + " Type: " + mediaPlatform);
	const handleLinkPress = (link) => {
		setShowMoreFilters(false);
		Linking.openURL("https://www." + link); // Open the link in the device's default browser
	};

	return (
		<View>
			<Text style={styles.mediaHeader}>
				{capitalizeFirstLetter(mediaPlatform)}
			</Text>
			{links.map((link, index) => (
				<TouchableOpacity key={index} onPress={() => handleLinkPress(link)}>
					<Text style={styles.link}>{link}</Text>
				</TouchableOpacity>
			))}
		</View>
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
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
		justifyContent: "flex-end", // Align at the bottom
	},
	textContainer: {
		alignSelf: "flex-start",
		marginLeft: 20,
		marginBottom: 10,
	},
	mediaHeader: {
		paddingBottom: 3,
		paddingTop: 10,
		// color: "white",
		fontSize: 14,
		fontWeight: "700",
		textAlign: "left", // Align text to the left
	},
	link: {
		// color: "white",
		paddingBottom: 3,
		fontSize: 12,
		fontWeight: "400",
		textAlign: "left", // Align text to the left
	},
});

export default LinkBottomSheet;
