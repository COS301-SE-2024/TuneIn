import React from "react";
import { Modal, Pressable, Text, View, StyleSheet } from "react-native";
import { colors } from "../styles/colors"; // Adjust the path if necessary

type NsfwModalProps = {
	visible: boolean;
	onProceed: () => void;
	onExit: () => void;
};

const NsfwModal: React.FC<NsfwModalProps> = ({
	visible,
	onProceed,
	onExit,
}) => {
	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onExit}
		>
			<Pressable
				style={styles.modalContainer}
				onPress={onExit}
				testID="modal-container"
			>
				<Pressable style={styles.modalView} onPress={() => {}}>
					<Text style={styles.modalTitle}>NSFW Content Warning</Text>
					<Text style={styles.modalText}>
						This room is marked as NSFW. Are you sure you want to continue?
					</Text>
					<View style={styles.modalButtonContainer}>
						<Pressable
							style={[styles.buttonModal, styles.buttonYes]}
							onPress={onProceed}
						>
							<Text style={styles.textStyle}>Yes, Stay</Text>
						</Pressable>
						<Pressable
							style={[styles.buttonModal, styles.buttonNo]}
							onPress={onExit}
						>
							<Text style={styles.textStyle}>No, Leave</Text>
						</Pressable>
					</View>
				</Pressable>
			</Pressable>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		justifyContent: "flex-end",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
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
	modalText: {
		marginTop: 10,
		fontSize: 16,
		textAlign: "center",
		fontWeight: "bold",
	},
	modalButtonContainer: {
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
	buttonYes: {
		backgroundColor: colors.primary,
		borderRadius: 25,
	},
	buttonNo: {
		backgroundColor: colors.secondary,
		borderRadius: 25,
	},
	textStyle: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 10,
	},
});

export default NsfwModal;
