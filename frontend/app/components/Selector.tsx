import React, { useState } from "react";
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

interface SelectorProps {
	options: string[];
	placeholder: string;
	visible: boolean;
	onSelect: (option: string) => void;
	onClose: () => void;
}

const Selector: React.FC<SelectorProps> = ({
	options,
	placeholder,
	visible,
	onSelect,
	onClose,
}) => {
	const [searchQuery, setSearchQuery] = useState("");

	// useEffect(() => {
	// 	// setItems(options);
	// }, [options]);

	const fuseOptions = {
		includeScore: true,
	};

	const fuse = new Fuse(options, fuseOptions);
	const result = fuse.search(searchQuery, { limit: 20 });
	const filteredOptions: string[] = result.map((item) => item.item);

	return (
		<Modal
			visible={visible}
			transparent={true}
			animationType="slide"
			onRequestClose={onClose}
			testID="genre-selector"
		>
			<View style={styles.modalContainer}>
				<View style={styles.modalContent}>
					<TextInput
						style={styles.searchInput}
						placeholder={`Search ${placeholder.toLowerCase()}...`}
						value={searchQuery}
						onChangeText={setSearchQuery}
						testID="genre-search-query"
					/>
						<FlatList
							testID="flat-list"
							data={filteredOptions}
							keyExtractor={(item) => item}
							style={styles.scrollView}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.filterOption}
									onPress={() => {
										onSelect(item);
										setSearchQuery("");
										onClose();
									}}
									testID={`${item}-genre-option`}
								>
									<Text style={styles.filterText}>{item}</Text>
								</TouchableOpacity>
							)}
						/>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={() => {
							setSearchQuery("");
							onClose();
						}}
					>
						<Text style={styles.filterText}>Close</Text>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
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
	filterText: {
		color: "#333",
		fontWeight: "bold",
	},
	closeButton: {
		marginTop: 20,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: colors.primary,
		borderRadius: 5,
	},
});

export default Selector;
