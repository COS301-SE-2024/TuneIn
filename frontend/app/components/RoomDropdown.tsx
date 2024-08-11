import React, { useState, useEffect } from "react";
import * as StorageService from "./../services/StorageService"; // Import StorageService
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	FlatList,
	Modal,
} from "react-native";
import { Entypo } from "@expo/vector-icons";
import { get } from "http";

type RoomDropdownProps = {
	initialRooms: string[];
};

const RoomDropdown: React.FC<RoomDropdownProps> = ({ initialRooms }) => {
	const [rooms, setRooms] = useState<string[]>(initialRooms);
	const [selectedRoom, setSelectedRoom] = useState<string>(initialRooms[0]);
	const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
	const [inputText, setInputText] = useState<string>("");

	useEffect(() => {
		// check if currentRoom is stored in StorageService
		// if it is, set selectedRoom to the stored value
		// if not, set selectedRoom to the first room in initialRooms
		// set rooms to initialRooms

		const getRoom = async () => {
			const currentRoom = await StorageService.getItem("currentRoom");
			if (currentRoom) {
				setSelectedRoom(currentRoom);
			} else {
				setSelectedRoom(initialRooms[0]);
			}
		};

		setRooms(initialRooms);
		getRoom();
	}, [initialRooms]);

	const handleRoomSelect = async (room: string) => {
		setSelectedRoom(room);
		setDropdownVisible(false);
		await StorageService.setItem("currentRoom", room);
	};

	return (
		<View style={styles.container}>
			<TouchableOpacity
				style={styles.dropdownButton}
				onPress={() => setDropdownVisible(!dropdownVisible)}
			>
				<Text style={styles.selectedText}>{selectedRoom}</Text>
				<Entypo name="chevron-small-down" size={24} color="black" />
			</TouchableOpacity>

			<Modal
				transparent={true}
				visible={dropdownVisible}
				animationType="fade"
				onRequestClose={() => setDropdownVisible(false)}
			>
				<TouchableOpacity
					style={styles.modalOverlay}
					activeOpacity={1}
					onPress={() => setDropdownVisible(false)}
				>
					<TouchableOpacity activeOpacity={1} style={styles.dropdown}>
						<TextInput
							style={styles.input}
							value={inputText}
							onChangeText={setInputText}
							placeholder="Search room"
							onFocus={() => setDropdownVisible(true)}
						/>
						<FlatList
							data={rooms.filter((room) =>
								room.toLowerCase().includes(inputText.toLowerCase()),
							)}
							keyExtractor={(item, index) => index.toString()}
							renderItem={({ item }) => (
								<TouchableOpacity onPress={() => handleRoomSelect(item)}>
									<Text style={styles.roomItem}>{item}</Text>
								</TouchableOpacity>
							)}
						/>
					</TouchableOpacity>
				</TouchableOpacity>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		alignItems: "flex-end",
		paddingTop: 20,
		paddingBottom: 10,
	},
	dropdownButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
		backgroundColor: "white",
		borderRadius: 10,
		borderColor: "lightgrey",
		borderWidth: 1,
		width: 150,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	selectedText: {
		fontSize: 16,
		color: "black",
	},
	dropdown: {
		backgroundColor: "white",
		borderRadius: 5,
		padding: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
		borderColor: "lightgrey",
		borderWidth: 1,
		width: 150,
	},
	modalOverlay: {
		flex: 1,
		justifyContent: "flex-start",
		alignItems: "flex-end",
		paddingTop: 50,
		marginRight: 20,
	},
	input: {
		borderColor: "lightgrey",
		borderWidth: 1,
		borderRadius: 5,
		padding: 10,
		marginBottom: 10,
		width: "100%",
	},
	roomItem: {
		padding: 10,
		fontSize: 16,
	},
});

export default RoomDropdown;
