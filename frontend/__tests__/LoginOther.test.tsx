import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import LoginOtherScreen from "../app/screens/Auth/LoginOther"; // Adjust the path accordingly

// Mocking the useRouter hook from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("LoginOtherScreen", () => {
	let mockNavigate: jest.Mock;
	let mockBack: jest.Mock;

	beforeEach(() => {
		// Reset mock functions before each test
		mockNavigate = jest.fn();
		mockBack = jest.fn();
		(useRouter as jest.Mock).mockReturnValue({
			navigate: mockNavigate,
			back: mockBack,
		});
	});

	it("renders correctly", () => {
		const { getByText } = render(<LoginOtherScreen />);
		expect(getByText("Authenticate With")).toBeTruthy();
		expect(getByText("Or Login with Details")).toBeTruthy();
	});

	it("navigates to the Login screen when the 'Account' button is pressed", () => {
		const { getByText } = render(<LoginOtherScreen />);
		const loginButton = getByText("Account");

		fireEvent.press(loginButton);
		expect(mockNavigate).toHaveBeenCalledWith("screens/Auth/LoginScreen");
	});

	it("navigates to the Register screen when the 'Register Now' text is pressed", () => {
		const { getByText } = render(<LoginOtherScreen />);
		const registerText = getByText(/Register Now/);

		fireEvent.press(registerText);
		expect(mockNavigate).toHaveBeenCalledWith("screens/Auth/RegisterOther");
	});

	it("goes back when the back button is pressed", () => {
		const { getByTestId } = render(<LoginOtherScreen />);
		const backButton = getByTestId("back-button");

		fireEvent.press(backButton);
		expect(mockBack).toHaveBeenCalled();
	});
});
