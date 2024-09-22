import React, { useState } from "react";
import {
	View,
	Text,
	Modal,
	FlatList,
	TextInput,
	StyleSheet,
	ScrollView,
	Pressable,
	Keyboard,
} from "react-native";

import {
	GestureHandlerRootView,
	TouchableOpacity,
} from "react-native-gesture-handler";
import { colors } from "../styles/colors";
import Fuse from "fuse.js";
import EditGenreBubble from "./EditGenreBubble";

interface SelectorProps {
	options: string[];
	placeholder: string;
	visible: boolean;
	onSelect: (selected: string[]) => void;
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
	const [selected, setSelected] = useState<string[]>([]);

	// useEffect(() => {
	// 	setSelected(options);
	// }, [selected]);

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
			<GestureHandlerRootView style={styles.modalContainer}>
				<View style={styles.modalContent}>
					<TextInput
						style={styles.searchInput}
						placeholder={`Search ${placeholder.toLowerCase()}...`}
						value={searchQuery}
						onChangeText={setSearchQuery}
						testID="genre-search-query"
					/>
					<View style={styles.chipsContainer}>
						<ScrollView horizontal>
							<View style={styles.chipWrapper}>
								{selected.map((genre, index) => (
									<EditGenreBubble
										key={index}
										text={genre}
										onPress={() =>
											setSelected(selected.filter((i) => i !== genre))
										}
									/>
								))}
							</View>
						</ScrollView>
					</View>
					<FlatList
						testID="flat-list"
						data={filteredOptions}
						keyExtractor={(item) => item}
						style={styles.scrollView}
						renderItem={({ item }) => (
							<TouchableOpacity
								style={styles.filterOption}
								onPress={() => {
									if (!selected.includes(item)) {
										setSelected([...selected, item]);
									}
								}}
								testID={`${item}-genre-option`}
							>
								<Text style={styles.filterText}>{item}</Text>
							</TouchableOpacity>
						)}
						keyboardShouldPersistTaps="always"
					/>
					<TouchableOpacity
						style={styles.closeButton}
						onPress={() => {
							setSearchQuery("");
							setSelected([]);
							Keyboard.dismiss();
                            
							if (selected.length > 0) {
								onSelect(selected);
							}

							onClose();
						}}
					>
						<Text style={styles.filterText}>
							{selected.length === 0
								? "Close"
								: selected.length === 1
									? "Add Genre"
									: "Add Genres"}
						</Text>
					</TouchableOpacity>
				</View>
			</GestureHandlerRootView>
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
	chipsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginTop: 10,
		paddingBottom: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
		width: "100%",
	},
	chipWrapper: {
		flexDirection: "row", // Arrange items in a row
		flexWrap: "wrap", // Allow wrapping to the next line
	},
});

export default Selector;
