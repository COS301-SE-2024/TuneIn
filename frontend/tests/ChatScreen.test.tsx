import React from "react";
import renderer, { act } from "react-test-renderer";
import ChatScreen from "../app/screens/messaging/ChatScreen";
import { useRouter, useLocalSearchParams } from "expo-router";
import { TextInput, TouchableOpacity } from "react-native";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

describe("ChatScreen", () => {
	const mockRouter = {
		back: jest.fn(),
	};

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
		(useLocalSearchParams as jest.Mock).mockReturnValue({ name: "John Doe" });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders the chat screen correctly", () => {
		const tree = renderer.create(<ChatScreen />).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("sends a message correctly", () => {
		const tree = renderer.create(<ChatScreen />);
		const messageInput = tree.root.findByType(TextInput);
		const sendButton = tree.root.findByType(TouchableOpacity);

		act(() => {
			messageInput.props.onChangeText("Hello");
		});

		expect(messageInput.props.value).toBe("Hello");

		act(() => {
			sendButton.props.onPress();
		});

		expect(messageInput.props.value).toBe("");
		const messageText = tree.root.findByProps({ children: "Hello" });
		expect(messageText).toBeTruthy();
	});

	it("navigates back when back button is pressed", () => {
		const tree = renderer.create(<ChatScreen />);
		const backButton = tree.root.findAllByType(TouchableOpacity)[0];

		act(() => {
			backButton.props.onPress();
		});

		expect(mockRouter.back).toHaveBeenCalled();
	});
});
