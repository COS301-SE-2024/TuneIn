import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ForgotPasswordScreen from "../app/screens/Auth/ForgotPassword";

// Mock useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn().mockReturnValue({
		push: jest.fn(),
		back: jest.fn(),
	}),
}));

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

describe("ForgotPasswordScreen", () => {
	it("renders correctly", () => {
		const { getByText, getByPlaceholderText } = render(
			<ForgotPasswordScreen />,
		);

		// Assert screen elements are rendered correctly
		expect(getByText("Forgot Password?")).toBeTruthy();
		expect(
			getByText(
				"Don't worry! It happens. Please enter your email address to receive a verification code.",
			),
		).toBeTruthy();
		expect(getByPlaceholderText("Enter your email")).toBeTruthy();
		expect(getByText("Send Code")).toBeTruthy();
		expect(getByText("Remember Password? Login")).toBeTruthy();
	});

	it("navigates to OTP screen when Send Code button is pressed", () => {
		const { getByText } = render(<ForgotPasswordScreen />);

		// Simulate click on Send Code button
		const sendCodeButton = getByText("Send Code");
		fireEvent.press(sendCodeButton);

		// Assert useRouter push function is called with correct pathname
		expect(require("expo-router").useRouter().push).toHaveBeenCalledTimes(1);
		expect(require("expo-router").useRouter().push).toHaveBeenCalledWith(
			"screens/Auth/OTP",
		);
	});

	it("navigates to Login screen when Remember Password? Login link is pressed", () => {
		const { getByText } = render(<ForgotPasswordScreen />);

		// Simulate click on Login link
		const loginLink = getByText("Remember Password? Login");
		fireEvent.press(loginLink);

		// Assert useRouter push function is called with correct pathname
		const pushMock = require("expo-router").useRouter().push;
		expect(pushMock).toHaveBeenCalledTimes(2);
		expect(pushMock).toHaveBeenNthCalledWith(1, "screens/Auth/OTP");
		expect(pushMock).toHaveBeenNthCalledWith(2, "screens/Auth/LoginScreen");
	});

	it("navigates back when back button is pressed", () => {
		const { getByTestId } = render(<ForgotPasswordScreen />);

		// Simulate click on back button
		const backButton = getByTestId("back-button");
		fireEvent.press(backButton);

		// Assert useRouter back function is called
		expect(require("expo-router").useRouter().back).toHaveBeenCalledTimes(1);
	});
});
