import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ForgotPasswordScreen from "../app/screens/Auth/ForgotPassword"; // Adjust the path as needed
import { Alert, AlertButton } from "react-native";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

jest.mock("amazon-cognito-identity-js", () => ({
	CognitoUser: jest.fn(() => ({
		forgotPassword: jest.fn(({ onSuccess }) => onSuccess()),
	})),
	CognitoUserPool: jest.fn(),
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

// Mock the Alert function
const mockAlert = jest.fn();
jest.spyOn(Alert, "alert").mockImplementation(mockAlert);

describe("ForgotPasswordScreen", () => {
	const mockRouterPush = jest.fn();
	const mockRouterBack = jest.fn();

	beforeAll(() => {
		(useRouter as jest.Mock).mockReturnValue({
			push: mockRouterPush,
			back: mockRouterBack,
		});
	});

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should display an alert if the email is invalid", () => {
		const { getByPlaceholderText, getByText } = render(
			<ForgotPasswordScreen />,
		);

		const emailInput = getByPlaceholderText("Enter your email");
		const sendCodeButton = getByText("Send Code");

		fireEvent.changeText(emailInput, "invalid-email");
		fireEvent.press(sendCodeButton);

		expect(Alert.alert).toHaveBeenCalledWith(
			"Invalid Email",
			"Please enter a valid email address",
			[{ text: "OK" }],
			{ cancelable: false },
		);
	});

	it("should display a confirmation alert with the correct email", async () => {
		const { getByPlaceholderText, getByText } = render(
			<ForgotPasswordScreen />,
		);

		const emailInput = getByPlaceholderText("Enter your email");
		const sendCodeButton = getByText("Send Code");

		fireEvent.changeText(emailInput, "test@example.com");
		fireEvent.press(sendCodeButton);

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Confirm Email",
				"Is this the correct email address? test@example.com",
				[
					{ text: "Cancel", style: "cancel" },
					{ text: "OK", onPress: expect.any(Function) },
				],
				{ cancelable: false },
			);
		});
	});

	it("should navigate to ResetPassword screen on confirmation", async () => {
		const { getByPlaceholderText, getByText } = render(
			<ForgotPasswordScreen />,
		);

		const emailInput = getByPlaceholderText("Enter your email");
		const sendCodeButton = getByText("Send Code");

		fireEvent.changeText(emailInput, "test@example.com");
		fireEvent.press(sendCodeButton);

		await waitFor(() => {
			const alertCalls = mockAlert.mock.calls;
			const confirmAlert = alertCalls.find(
				(call: any) => call[0] === "Confirm Email",
			);

			const confirmButton = confirmAlert[2].find(
				(button: AlertButton) => button.text === "OK",
			);
			confirmButton.onPress();
		});

		expect(mockRouterPush).toHaveBeenCalledWith({
			pathname: "screens/Auth/ResetPassword",
			params: { email: "test@example.com" },
		});
	});
});
