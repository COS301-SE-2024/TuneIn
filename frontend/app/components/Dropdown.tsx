import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../styles/colors";
// import Fuse from "fuse.js";
import Selector from "./Selector";

interface DropdownProps {
	options: string[];
	placeholder: string;
	onSelect: (option: string) => void;
	selectedOption: string | null;
	setSelectedOption: (option: string | null) => void;
}

const Dropdown: React.FC<DropdownProps> = ({
	options,
	placeholder,
	onSelect,
	selectedOption,
	setSelectedOption,
}) => {
	const [modalVisible, setModalVisible] = useState(false);
	const toggleModal = () => setModalVisible(!modalVisible);

	const handleSelectOption = (option: string) => {
		setSelectedOption(option);
		onSelect(option);
		toggleModal();
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[
					styles.filterDropDown,
					selectedOption ? styles.activeFilter : {},
				]}
				onPress={() => {
					if (selectedOption === null) {
						toggleModal();
					} else {
						setSelectedOption(null);
					}
				}}
			>
				<Text style={styles.filterText}>{selectedOption || placeholder}</Text>
			</TouchableOpacity>

			<Selector
				options={options}
				placeholder={placeholder}
				visible={modalVisible}
				onSelect={handleSelectOption}
				onClose={toggleModal}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginRight: 10,
		alignItems: "center",
	},
	filterDropDown: {
		paddingVertical: 10,
		// paddingHorizontal: 20,
		borderRadius: 7,
		borderWidth: 1,
		borderColor: "#ccc",
		alignItems: "center",
		width: "100%",
	},
	activeFilter: {
		backgroundColor: colors.primary, // Example primary color
		borderColor: colors.primary, // Example primary color
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 5.84,
		elevation: 5,
	},
	filterText: {
		color: "#333",
		fontWeight: "bold",
	},
});

export default Dropdown;
