import React, { useState } from "react";
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	Animated,
	StyleSheet,
	Easing,
} from "react-native";
import { colors } from "../../styles/colors";

interface SplittingPopUpProps {
	isVisible: boolean;
	onClose: () => void;
	onConfirm: (choice: true | false) => Promise<void>; // Updated to take a choice
}

const SplittingPopUp: React.FC<SplittingPopUpProps> = ({
	isVisible,
	onClose,
	onConfirm,
}) => {
	const [slideAnim] = useState(new Animated.Value(300)); // Initial position of the popup
	const [isYesPressed, setIsYesPressed] = useState(false); // State to track "Yes" button press
	const [isNoPressed, setIsNoPressed] = useState(false); // State to track "No" button press

	React.useEffect(() => {
		if (isVisible) {
			Animated.timing(slideAnim, {
				toValue: 0, // Move up from the bottom
				duration: 300,
				easing: Easing.ease,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(slideAnim, {
				toValue: 300, // Move down to the bottom
				duration: 300,
				easing: Easing.ease,
				useNativeDriver: true,
			}).start();
		}
	}, [isVisible, slideAnim]);

	const handleYes = async () => {
		await onConfirm(true); // Call with 'yes'
		onClose();
	};

	const handleNo = async () => {
		await onConfirm(false); // Call with 'no'
		onClose();
	};

	return (
		<Modal
			testID="modal"
			transparent={true}
			animationType="none"
			visible={isVisible}
			onRequestClose={onClose}
		>
			<View style={styles.modalOverlay}>
				<Animated.View
					style={[
						styles.popupContainer,
						{
							transform: [{ translateY: slideAnim }],
						},
					]}
				>
					<Text style={styles.title}>Two Distinct Queues Detected</Text>
					<Text style={styles.message}>
						We have noticed that there are two distinct queues. Do you want to
						create 2 branching rooms from the different queues?
					</Text>

					<View style={styles.buttonContainer}>
						{/* "Yes" Button */}
						<TouchableOpacity
							style={[
								styles.button,
								isYesPressed && {
									backgroundColor: colors.primary,
								},
							]}
							onPress={handleYes}
							onPressIn={() => setIsYesPressed(true)}
							onPressOut={() => setIsYesPressed(false)}
						>
							<Text style={[styles.yesText, isYesPressed && { color: "#FFF" }]}>
								Yes, create rooms
							</Text>
						</TouchableOpacity>

						{/* "No" Button */}
						<TouchableOpacity
							style={[
								styles.button,
								isNoPressed && {
									backgroundColor: "#FF3B30",
								},
							]}
							onPress={handleNo}
							onPressIn={() => setIsNoPressed(true)}
							onPressOut={() => setIsNoPressed(false)}
						>
							<Text style={[styles.noText, isNoPressed && { color: "#FFF" }]}>
								No, cancel
							</Text>
						</TouchableOpacity>
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		justifyContent: "flex-end",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	popupContainer: {
		backgroundColor: "white",
		padding: 30, // Increased padding for better spacing
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	title: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 15,
	},
	message: {
		fontSize: 16,
		marginBottom: 25,
		textAlign: "center", // Center the text
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20, // More spacing above buttons
	},
	button: {
		width: "48%", // Fixed width for buttons
		paddingVertical: 15,
		marginHorizontal: 5, // Adjusted margin to align buttons properly
		alignItems: "center",
		backgroundColor: "#E0E0E0", // Grey background for buttons
		borderRadius: 25,
	},
	yesText: {
		color: colors.primary, // Colored text instead of button
		fontWeight: "bold",
	},
	noText: {
		color: "#FF3B30", // Different color for No option
		fontWeight: "bold",
	},
});

export default SplittingPopUp;
