import React, { useState, useRef } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { FlyingView, ObjectConfig } from "react-native-flying-objects";
import EmojiPicker, {
	EmojiPickerRef,
} from "../app/components/rooms/emojiPicker"; // Adjust the path as per your file structure

const TestPage = () => {
	const [object, setObject] = useState<ObjectConfig[]>([]);
	const emojiPickerRef = useRef<EmojiPickerRef>(null);

	const handleSelectEmoji = (emoji: string) => {
		setObject((prev) => [...prev, { object: <Text>{emoji}</Text> }]);
	};

	const passEmojiToTextField = (emoji: string) => {
		emojiPickerRef.current?.passEmojiToTextField(emoji);
	};

	return (
		<View style={styles.container}>
			<FlyingView object={object} />
			<EmojiPicker ref={emojiPickerRef} onSelectEmoji={handleSelectEmoji} />
			{/* Example button to demonstrate passEmojiToTextField */}
			<TouchableOpacity
				onPress={() => passEmojiToTextField("😎")}
				style={styles.button}
			>
				<Text style={styles.buttonText}>Add 😎 Emoji Programmatically</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
	},
	button: {
		padding: 10,
		backgroundColor: "#ccc",
		borderRadius: 5,
		marginTop: 20,
	},
	buttonText: {
		fontSize: 16,
	},
});

export default TestPage;
