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
		render(<CreateChatScreen closeModal={closeModalMock} />);

		expect(screen.getByText("New Chat")).toBeTruthy();
		expect(screen.getByPlaceholderText("Search for a user...")).toBeTruthy();
		expect(screen.getByTestId("close-button")).toBeTruthy();
	});

	it("calls closeModal when close button is pressed", () => {
		render(<CreateChatScreen closeModal={closeModalMock} />);

		fireEvent.press(screen.getByTestId("close-button"));

		expect(closeModalMock).toHaveBeenCalled();
	});

	it("filters users based on search query", () => {
		render(<CreateChatScreen closeModal={closeModalMock} />);

		fireEvent.changeText(
			screen.getByPlaceholderText("Search for a user..."),
			"John Doe",
		);

		expect(screen.getByText("John Doe")).toBeTruthy();
		expect(screen.queryByText("Jane Smith")).toBeNull();
	});

	// it("navigates to ChatScreen when a user is selected", () => {
	// 	render(<CreateChatScreen closeModal={closeModalMock} />);

	// 	fireEvent.press(screen.getAllByText("John Doe")[0]);

	// 	expect(routerPushMock).toHaveBeenCalledWith(
	// 		"/screens/messaging/ChatScreen?name=John Doe&avatar=https://images.pexels.com/photos/3792581/pexels-photo-3792581.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
	// 	);
	// });
});
