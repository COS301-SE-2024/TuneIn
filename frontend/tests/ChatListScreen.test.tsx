import React from "react";
import renderer, { act } from "react-test-renderer";
import ChatListScreen from "../app/screens/messaging/ChatListScreen";
import { useRouter } from "expo-router";
import { TouchableOpacity, TextInput } from "react-native";
import { Font } from "expo-font";
import { Asset } from "expo-asset";

jest.mock("expo-font", () => ({
	...jest.requireActual("expo-font"),
	loadAsync: jest.fn(),
}));

jest.mock("expo-asset", () => ({
	...jest.requireActual("expo-asset"),
	fromModule: jest.fn(() => ({
		downloadAsync: jest.fn(),
		uri: "mock-uri",
	})),
}));

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("ChatListScreen", () => {
	const mockRouter = {
		push: jest.fn(),
		back: jest.fn(),
	};

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue(mockRouter);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders the chat list screen correctly", () => {
		const tree = renderer.create(<ChatListScreen />).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("handles search input correctly", () => {
		const tree = renderer.create(<ChatListScreen />);
		const searchInput = tree.root.findByType(TextInput);

		act(() => {
			searchInput.props.onChangeText("John");
		});

		expect(searchInput.props.value).toBe("John");
	});

	it("navigates to chat screen on chat item press", () => {
		const tree = renderer.create(<ChatListScreen />);
		const chatItem = tree.root.findAllByType(TouchableOpacity)[1]; // Skip the back button

		act(() => {
			chatItem.props.onPress();
		});

		expect(mockRouter.push).toHaveBeenCalledWith(
			"/screens/ChatScreen?name=John Doe&avatar=https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg",
		);
	});

	it("navigates back when back button is pressed", () => {
		const tree = renderer.create(<ChatListScreen />);
		const backButton = tree.root.findAllByType(TouchableOpacity)[0];

		act(() => {
			backButton.props.onPress();
		});

		expect(mockRouter.back).toHaveBeenCalled();
	});
});
