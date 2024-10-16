import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../styles/colors";
import { useNavigation } from "@react-navigation/native"; // Import useNavigation

interface BannedModalProps {
	visible: boolean;
	onClose: () => void;
}

const BannedModal: React.FC<BannedModalProps> = ({ visible, onClose }) => {
	// Use navigation hook
	const navigation = useNavigation();

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View style={styles.modalView}>
					<Text style={styles.modalTextHeader}>You Have Been Banned</Text>
					<Text style={styles.modalText}>
						The host has banned you from this room. You can no longer interact
						with this room or its participants.
					</Text>
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[styles.buttonModal, styles.backButton]}
							onPress={() => {
								navigation.goBack(); // Use navigation to go back
								onClose(); // Call onClose to handle modal state
							}}
							testID="back-button"
						>
							<Text style={styles.buttonText}>Okay</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		justifyContent: "flex-end", // Align to bottom
		backgroundColor: "rgba(0, 0, 0, 0.5)", // Add a background overlay
	},
	modalView: {
		width: "100%",
		height: "28%",
		backgroundColor: "white",
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		paddingBottom: 40,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	modalTextHeader: {
		fontSize: 19,
		marginBottom: 15,
		textAlign: "center",
		fontWeight: "bold",
	},
	modalText: {
		marginTop: 10,
		fontSize: 16,
		textAlign: "center",
		fontWeight: "bold",
	},
	buttonContainer: {
		marginTop: 30,
		flexDirection: "row",
		justifyContent: "center", // Center the button container
		width: "100%",
	},
	buttonModal: {
		borderRadius: 5,
		padding: 10,
		elevation: 2,
		width: "100%",
		alignItems: "center",
	},
	backButton: {
		backgroundColor: colors.primary,
		borderRadius: 25,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
		fontSize: 16,
	},
});

export default BannedModal;
