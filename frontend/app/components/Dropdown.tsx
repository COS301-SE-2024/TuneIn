import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Modal,
	FlatList,
	TextInput,
	StyleSheet,
	ScrollView,
} from "react-native";
import { colors } from "../styles/colors";
import Fuse from "fuse.js";

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
	const [searchQuery, setSearchQuery] = useState("");
	const [items, setItems] = useState(options);

	useEffect(() => {
		setItems(options);
	}, [options]);

	const toggleModal = () => setModalVisible(!modalVisible);

	const handleSelectOption = (option: string) => {
		setSelectedOption(option);
		onSelect(option);
		toggleModal();
	};

	const fuseOptions = {
		includeScore: true,
	};

	const fuse = new Fuse(options, fuseOptions);

	const result = fuse.search(searchQuery, {limit: 20});
	const filteredOptions: string[] = result.map((item) => item.item);

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={[
					styles.filterDropDown,
					selectedOption ? styles.activeFilter : {},
				]}
				onPress={toggleModal}
			>
				<Text style={styles.filterText}>{selectedOption || placeholder}</Text>
			</TouchableOpacity>

			<Modal
				visible={modalVisible}
				transparent={true}
				animationType="slide"
				onRequestClose={toggleModal}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<TextInput
							style={styles.searchInput}
							placeholder={`Search ${placeholder.toLowerCase()}...`}
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
						<ScrollView style={styles.scrollView}>
							<FlatList
								testID="flat-list"
								data={filteredOptions}
								keyExtractor={(item) => item}
								renderItem={({ item }) => (
									<TouchableOpacity
										style={styles.filterOption}
										onPress={() => handleSelectOption(item)}
									>
										<Text style={styles.filterText}>{item}</Text>
									</TouchableOpacity>
								)}
							/>
						</ScrollView>
						<TouchableOpacity style={styles.closeButton} onPress={toggleModal}>
							<Text style={styles.filterText}>Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		margin: 10,
		alignItems: "center",
	},
	filterDropDown: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 7,
		borderWidth: 1,
		borderColor: "#ccc",
		alignItems: "center",
		width: 120, // Adjust width to fit inline layout
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
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	modalContent: {
		width: "80%",
		maxHeight: "80%", // Ensure modal content doesn't exceed the screen height
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 20,
		alignItems: "center",
	},
	searchInput: {
		width: "100%",
		padding: 10,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "#ccc",
		marginBottom: 10,
	},
	scrollView: {
		width: "100%",
		marginBottom: 10,
	},
	filterOption: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
		width: "100%",
		alignItems: "center",
	},
	closeButton: {
		marginTop: 20,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: colors.primary,
		borderRadius: 5,
	},
});

export default Dropdown;
