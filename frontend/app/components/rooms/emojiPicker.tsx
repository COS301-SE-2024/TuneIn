import React, { useState, forwardRef, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type EmojiPickerProps = {
	onSelectEmoji: (emoji: string) => void;
};

export interface EmojiPickerRef {
	passEmojiToTextField: (emoji: string) => void;
}

const emojis = ["😀", "😂", "🥰", "😎", "😢", "👍", "🎉"];

const EmojiPicker = forwardRef<EmojiPickerRef, EmojiPickerProps>(
	({ onSelectEmoji }, ref) => {
		const [isOpen, setIsOpen] = useState(false);

		useImperativeHandle(ref, () => ({
			passEmojiToTextField: (emoji: string) => {
				onSelectEmoji(emoji);
				setIsOpen(false);
			},
		}));

		const handlePress = () => {
			setIsOpen(!isOpen);
		};

		const handleEmojiPress = (emoji: string) => {
			onSelectEmoji(emoji);
			setIsOpen(false);
		};

		return (
			<View style={styles.container}>
				<TouchableOpacity
					testID="EmojiButton"
					onPress={handlePress}
					style={styles.iconButton}
				>
					<Ionicons name="happy" size={24} />
				</TouchableOpacity>
				{isOpen && (
					<View style={styles.emojiContainer}>
						{emojis.map((emoji) => (
							<TouchableOpacity
								key={emoji}
								onPress={() => handleEmojiPress(emoji)}
							>
								<Text style={styles.emoji}>{emoji}</Text>
							</TouchableOpacity>
						))}
					</View>
				)}
			</View>
		);
	},
);

const styles = StyleSheet.create({
	container: {
		position: "relative", // Ensure the container is positioned relative to its parent
	},
	iconButton: {
		zIndex: 2, // Ensure the icon is above other components
	},
	emojiContainer: {
		position: "absolute", // Position it absolutely
		bottom: 40,
		right: 0, // Align to the right of the icon
		flexDirection: "row",
		padding: 10,
		backgroundColor: "#f0f0f0", // Light grey background color
		borderRadius: 15, // Rounded corners
		elevation: 4, // Shadow for Android
		shadowColor: "#000", // Shadow for iOS
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 10,
		zIndex: 1, // Ensure it overlays above other components
	},
	emoji: {
		fontSize: 24,
		marginHorizontal: 5,
	},
});

export default EmojiPicker;
