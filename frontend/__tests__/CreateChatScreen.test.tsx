// CreateChatScreen.test.tsx
import React from "react";
import { render, fireEvent, screen } from "@testing-library/react-native";
import CreateChatScreen from "../app/screens/messaging/CreateChatScreen";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("CreateChatScreen", () => {
	const closeModalMock = jest.fn();
	const routerPushMock = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: routerPushMock });
		closeModalMock.mockClear();
		routerPushMock.mockClear();
	});

	it("renders correctly", () => {
		render(<CreateChatScreen closeModal={closeModalMock} friends={[]} />);

		expect(screen.getByText("New Chat")).toBeTruthy();
		expect(screen.getByPlaceholderText("Search for a user...")).toBeTruthy();
		expect(screen.getByTestId("close-button")).toBeTruthy();
	});

	it("calls closeModal when close button is pressed", () => {
		render(<CreateChatScreen closeModal={closeModalMock} friends={[]} />);

		fireEvent.press(screen.getByTestId("close-button"));

		expect(closeModalMock).toHaveBeenCalled();
	});
});
