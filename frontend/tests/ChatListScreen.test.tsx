import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ChatListScreen from "../app/screens/messaging/ChatListScreen";
import { useRouter } from "expo-router";
import { TextInput, TouchableOpacity } from "react-native";

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
		const { toJSON } = render(<ChatListScreen />);
		expect(toJSON()).toMatchSnapshot();
	});

	it("handles search input correctly", () => {
		const { getByPlaceholderText } = render(<ChatListScreen />);
		const searchInput = getByPlaceholderText("Search for a user..."); // Adjust placeholder to match your component

		fireEvent.changeText(searchInput, "John");

		expect(searchInput.props.value).toBe("John");
	});

	it("navigates back when back button is pressed", () => {
		const { getAllByTestId } = render(<ChatListScreen />);
		const backButton = getAllByTestId("back-button")[0]; // Assuming the back button has a testID of 'back-button'

		fireEvent.press(backButton);

		expect(mockRouter.back).toHaveBeenCalled();
	});
});
