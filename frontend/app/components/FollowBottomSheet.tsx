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
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

interface BottomSheetProps {
	showFollowOptions: boolean;
	isFriend?: boolean;
	isPending?: boolean;
	isPotential?: boolean;
	handleUnfollow?: () => void;
	handleRequest?: (value: boolean) => void;
	handleUnfriend?: () => void;
	handleCancel?: () => void;
	sendRequest?: () => void;
	setShowMoreOptions: (value: boolean) => void;
}

// Define the functional component with default values set in the parameters
const FollowBottomSheet: React.FC<BottomSheetProps> = ({
	isFriend = false,
	isPending = false,
	isPotential = false,
	setShowMoreOptions: setShowMoreFilters = () => {},
	handleUnfollow = () => {},
	handleRequest = (value: boolean) => {},
	sendRequest = () => {},
	handleUnfriend = () => {},
	handleCancel = () => {},
	showFollowOptions: showMoreFilters = true,
}) => {
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
											<Text style={{ fontSize: 20, fontWeight: "bold" }}>
												Profile Name
											</Text>
										</View>
										<View>
											{!isFriend ? (
												<>
													<TouchableOpacity
														style={{ paddingTop: 20 }}
														hitSlop={{ top: 5, bottom: 5, left: 50, right: 50 }}
														onPress={handleUnfollow}
													>
														<Text style={{ fontSize: 18 }}>Unfollow</Text>
													</TouchableOpacity>
													{isPending ? (
														<TouchableOpacity
															style={{ paddingTop: 20 }}
															hitSlop={{
																top: 5,
																bottom: 5,
																left: 50,
																right: 50,
															}}
															onPress={handleCancel}
														>
															<Text style={{ fontSize: 18 }}>
																Cancel Friend Request
															</Text>
														</TouchableOpacity>
													) : isPotential ? (
														<>
															<TouchableOpacity
																style={{ paddingTop: 20 }}
																hitSlop={{
																	top: 5,
																	bottom: 5,
																	left: 50,
																	right: 50,
																}}
																onPress={() => handleRequest(true)}
															>
																<Text style={{ fontSize: 18 }}>
																	Accept Friend Request
																</Text>
															</TouchableOpacity>
															<TouchableOpacity
																style={{ paddingTop: 20 }}
																hitSlop={{
																	top: 5,
																	bottom: 5,
																	left: 50,
																	right: 50,
																}}
																onPress={() => handleRequest(false)}
															>
																<Text style={{ fontSize: 18 }}>
																	Reject Friend Request
																</Text>
															</TouchableOpacity>
														</>
													) : (
														<TouchableOpacity
															style={{ paddingTop: 20 }}
															hitSlop={{
																top: 5,
																bottom: 5,
																left: 50,
																right: 50,
															}}
															onPress={sendRequest}
														>
															<Text style={{ fontSize: 18 }}>
																Send Friend Request
															</Text>
														</TouchableOpacity>
													)}
												</>
											) : (
												<TouchableOpacity
													style={{ paddingTop: 20 }}
													hitSlop={{ top: 5, bottom: 5, left: 50, right: 50 }}
													onPress={handleUnfriend}
												>
													<Text style={{ fontSize: 18 }}>Unfriend</Text>
												</TouchableOpacity>
											)}
										</View>
									</Animated.View>
								</ScrollView>
							</TouchableWithoutFeedback>
						</KeyboardAvoidingView>
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

export default FollowBottomSheet;
