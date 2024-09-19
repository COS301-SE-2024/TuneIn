import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import LoginScreen from "../../app/screens/Auth/LoginScreen";
import { useRouter } from "expo-router";

// Mock services and functions
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

// Mock amazon-cognito-identity-js
jest.mock("amazon-cognito-identity-js", () => ({
	CognitoUserPool: jest.fn(),
	CognitoUser: jest.fn(),
	AuthenticationDetails: jest.fn(),
}));

jest.mock("../../app/services/StorageService", () => ({
	setItem: jest.fn(),
}));

jest.mock("../../app/services/AuthManagement", () => ({
	exchangeCognitoToken: jest.fn(),
}));

jest.mock("../../app/services/Live", () => ({
	initialiseSocket: jest.fn(),
	instanceExists: jest.fn(),
}));

describe("LoginScreen", () => {
	it("renders all components correctly", () => {
		const { getByPlaceholderText, getByText, getByTestId } = render(
			<LoginScreen />,
		);

		// Check if the back button is rendered
		expect(getByTestId("back-button")).toBeTruthy();

		// Check if header text is rendered
		expect(getByText("Welcome Back to TuneIn")).toBeTruthy();

		// Check if email/username input is rendered
		expect(getByPlaceholderText("Enter your email or username")).toBeTruthy();

		// Check if password input is rendered
		expect(getByPlaceholderText("*********")).toBeTruthy();

		// Check if "Forgot Password?" link is rendered
		expect(getByText("Forgot Password?")).toBeTruthy();

		// Check if Remember Me checkbox is rendered
		expect(getByText("Remember Me")).toBeTruthy();

		// Check if the login button is rendered
		expect(getByText("LOGIN")).toBeTruthy();

		// Check if the register link is rendered
		expect(getByText("Register Now")).toBeTruthy();
	});

	it("navigates correctly when buttons are pressed", () => {
		const router = { replace: jest.fn(), navigate: jest.fn(), back: jest.fn() };
		(useRouter as jest.Mock).mockReturnValue(router);

		const { getByText, getByTestId } = render(<LoginScreen />);

		// Back button
		fireEvent.press(getByTestId("back-button"));
		expect(router.back).toHaveBeenCalled();

		// Forgot Password button
		fireEvent.press(getByText("Forgot Password?"));
		expect(router.navigate).toHaveBeenCalledWith(
			"/screens/Auth/ForgotPassword",
		);

		// Register Now link
		fireEvent.press(getByText("Register Now"));
		expect(router.navigate).toHaveBeenCalledWith("/screens/Auth/RegisterOther");
	});
});
