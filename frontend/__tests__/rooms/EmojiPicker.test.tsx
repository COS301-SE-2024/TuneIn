import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import EmojiPicker, {
	EmojiPickerRef,
} from "../../app/components/rooms/emojiPicker"; // Adjust the import path as necessary
import { Ionicons } from "@expo/vector-icons";
import { act } from "react-test-renderer";

describe("EmojiPicker", () => {
	let onSelectEmoji: jest.Mock;
	let emojiPickerRef: React.RefObject<EmojiPickerRef>;

	beforeEach(() => {
		onSelectEmoji = jest.fn();
		emojiPickerRef = React.createRef<EmojiPickerRef>();
	});

	it("renders correctly", () => {
		render(<EmojiPicker onSelectEmoji={onSelectEmoji} ref={emojiPickerRef} />);

		expect(screen.getByTestId("EmojiButton")).toBeTruthy();
	});

	it("opens and closes emoji container when icon button is pressed", () => {
		render(<EmojiPicker onSelectEmoji={onSelectEmoji} ref={emojiPickerRef} />);

		const iconButton = screen.getByTestId("EmojiButton");

		// Initially, emoji container should not be in the document
		expect(screen.queryByText("😀")).toBeNull();

		// Open emoji picker
		fireEvent.press(iconButton);
		expect(screen.getByText("😀")).toBeTruthy();

		// Close emoji picker
		fireEvent.press(iconButton);
		expect(screen.queryByText("😀")).toBeNull();
	});

	it("calls onSelectEmoji with the correct emoji when an emoji is pressed", () => {
		render(<EmojiPicker onSelectEmoji={onSelectEmoji} ref={emojiPickerRef} />);

		const iconButton = screen.getByTestId("EmojiButton");

		// Open emoji picker
		fireEvent.press(iconButton);

		const emoji = screen.getByText("😀");
		fireEvent.press(emoji);

		expect(onSelectEmoji).toHaveBeenCalledWith("😀");
	});

	it("executes passEmojiToTextField method from the ref", () => {
		render(<EmojiPicker onSelectEmoji={onSelectEmoji} ref={emojiPickerRef} />);

		// Open emoji picker
		fireEvent.press(screen.getByTestId("EmojiButton"));

		act(() => {
			emojiPickerRef.current?.passEmojiToTextField("😎");
		});

		expect(onSelectEmoji).toHaveBeenCalledWith("😎");
	});
});
