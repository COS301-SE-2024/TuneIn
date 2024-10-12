import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../styles/colors";

interface RoomModalProps {
	visible: boolean;
	onClose: () => void;
	onViewChildRooms: () => void;
}

const RoomModal: React.FC<RoomModalProps> = ({
	visible,
	onClose,
	onViewChildRooms,
}) => {
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.overlay}>
				<View style={styles.modalView}>
					<Text style={styles.modalTextHeader}>This Room Has Been Split</Text>
					<Text style={styles.modalText}>
						Would you like to view child rooms or stay in this room?
					</Text>
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={[styles.buttonModal, styles.primaryButton]}
							onPress={onViewChildRooms}
						>
							<Text style={styles.buttonText}>View Sub Rooms</Text>
						</TouchableOpacity>
						<TouchableOpacity
							style={[styles.buttonModal, styles.secondaryButton]}
							onPress={onClose}
						>
							<Text style={styles.buttonText}>Stay in Room</Text>
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
		height: "26%",
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
		justifyContent: "space-between",
		width: "100%",
	},
	buttonModal: {
		borderRadius: 5,
		padding: 10,
		elevation: 2,
		width: "45%",
		alignItems: "center",
	},
	primaryButton: {
		backgroundColor: colors.primary,
		borderRadius: 25,
	},
	secondaryButton: {
		backgroundColor: colors.secondary,
		borderRadius: 25,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
});

export default RoomModal;
