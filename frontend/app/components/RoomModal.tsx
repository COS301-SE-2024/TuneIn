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
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<Text style={styles.modalTextHeader}>This Room Has Been Split</Text>
					<Text style={styles.modalText}>
						Would you like to view child rooms or stay in this room?
					</Text>
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={styles.primaryButton}
							onPress={onViewChildRooms}
						>
							<Text style={styles.buttonText}>View Sub Rooms</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
							<Text style={styles.buttonText}>Stay in Room</Text>
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
		marginTop: 10,
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	primaryButton: {
		padding: 10,
		paddingHorizontal: 15,
		marginRight: 10, // Add space between buttons
		backgroundColor: colors.primary,
		borderRadius: 25,
	},
	secondaryButton: {
		backgroundColor: colors.secondary,
		borderRadius: 25,
		padding: 10,
		paddingHorizontal: 20,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
});

export default RoomModal;
