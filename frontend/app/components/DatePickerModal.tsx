// import React from "react";
// import ReactDatePicker from "react-datepicker";
// import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

// // TypeScript type for the date value
// type DatePickerProps = {
// 	selectedDate: Date | null;
// 	onDateChange: (date: Date | null) => void;
// 	isVisible: boolean;
// 	onClose: () => void;
// };

// const DatePickerModal: React.FC<DatePickerProps> = ({
// 	selectedDate,
// 	onDateChange,
// 	isVisible,
// 	onClose,
// }) => {
// 	return (
// 		<Modal
// 			transparent={true}
// 			visible={isVisible}
// 			onRequestClose={onClose}
// 			animationType="slide"
// 		>
// 			<View style={styles.modalBackground}>
// 				<View style={styles.modalContainer}>
// 					<Text style={styles.datePickerLabel}>Select a Date:</Text>
// 					<ReactDatePicker
// 						selected={selectedDate}
// 						onChange={(date) => {
// 							onDateChange(date);
// 							onClose();
// 						}}
// 						dateFormat="yyyy/MM/dd"
// 						placeholderText="Select a date"
// 						className="react-datepicker-wrapper" // Add this for custom styling
// 					/>
// 					<TouchableOpacity style={styles.button} onPress={onClose}>
// 						<Text style={styles.buttonText}>Close</Text>
// 					</TouchableOpacity>
// 				</View>
// 			</View>
// 		</Modal>
// 	);
// };

// const styles = StyleSheet.create({
// 	modalBackground: {
// 		flex: 1,
// 		justifyContent: "center",
// 		alignItems: "center",
// 		backgroundColor: "rgba(0, 0, 0, 0.5)",
// 	},
// 	modalContainer: {
// 		backgroundColor: "#fff",
// 		borderRadius: 10,
// 		padding: 20,
// 		width: "80%",
// 		maxWidth: 400,
// 		alignItems: "center",
// 	},
// 	datePickerLabel: {
// 		fontSize: 18,
// 		marginBottom: 10,
// 	},
// 	button: {
// 		backgroundColor: "#08BDBD",
// 		padding: 10,
// 		borderRadius: 5,
// 		marginTop: 10,
// 	},
// 	buttonText: {
// 		color: "#fff",
// 		fontSize: 16,
// 	},
// });

// export default DatePickerModal;
