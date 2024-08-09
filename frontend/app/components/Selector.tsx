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
const Dropdown: React.FC<DropdownProps> = ({}) => {
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

	const result = fuse.search(searchQuery, { limit: 20 });
	const filteredOptions: string[] = result.map((item) => item.item);

	return (
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
	);
};
