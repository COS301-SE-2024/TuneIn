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
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<Text style={styles.modalTextHeader}>You Have Been Banned</Text>
					<Text style={styles.modalText}>
						The host has banned you from this room. You can no longer interact
						with this room or its participants.
					</Text>
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={styles.backButton}
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
	centeredView: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 22,
	},
	modalView: {
		margin: 20,
		backgroundColor: "white",
		borderRadius: 20,
		padding: 35,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 2,
		},
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
		marginBottom: 16,
		textAlign: "center",
	},
	buttonContainer: {
		marginTop: 20,
		flexDirection: "row",
		justifyContent: "center", // Center button in the container
		width: "100%", // Ensure it takes full width
	},
	backButton: {
		paddingVertical: 10,
		paddingHorizontal: 30,
		backgroundColor: colors.primary,
		borderRadius: 20,
		// No margins here to prevent it from being offset
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default BannedModal;
