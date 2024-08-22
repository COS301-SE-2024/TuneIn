import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PasswordReset from "../app/screens/Auth/ResetPassword";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Alert } from "react-native";

// Mocking useRouter and useLocalSearchParams from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
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

// Mock implementation for CognitoUser and CognitoUserPool classes
jest.mock("amazon-cognito-identity-js", () => {
	const confirmPasswordMock = jest.fn((code, password, callbacks) => {
		if (code === "correctCode") {
			callbacks.onSuccess();
		} else {
			callbacks.onFailure();
		}
	});

	return {
		CognitoUser: jest.fn().mockImplementation(() => ({
			confirmPassword: confirmPasswordMock,
		})),
		CognitoUserPool: jest.fn(),
	};
});

// Mock the Alert.alert method
jest.spyOn(Alert, "alert");

const mockRouterPush = jest.fn();
const mockRouterBack = jest.fn();

describe("PasswordReset", () => {
	beforeEach(() => {
		// Mocking the return values of useRouter and useLocalSearchParams
		(useRouter as jest.Mock).mockReturnValue({
			push: mockRouterPush,
			back: mockRouterBack,
		});

		(useLocalSearchParams as jest.Mock).mockReturnValue({
			email: "test@example.com",
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly", () => {
		const { getByText } = render(<PasswordReset />);
		expect(getByText("Password Reset")).toBeTruthy();
	});

	it("handles successful password reset", async () => {
		const { getByTestId, getByText } = render(<PasswordReset />);
		const codeInput = getByTestId("verification-code-input");
		const newPasswordInput = getByTestId("new-password-input");
		const confirmPasswordInput = getByTestId("confirm-password-input");
		const confirmButton = getByText("Confirm Reset");

		fireEvent.changeText(codeInput, "correctCode");
		fireEvent.changeText(newPasswordInput, "newPassword");
		fireEvent.changeText(confirmPasswordInput, "newPassword");
		fireEvent.press(confirmButton);

		await waitFor(() => {
			expect(mockRouterPush).toHaveBeenCalledWith("screens/Auth/LoginScreen");
		});
	});

	it("handles failed password reset", async () => {
		const { getByTestId, getByText } = render(<PasswordReset />);
		const codeInput = getByTestId("verification-code-input");
		const newPasswordInput = getByTestId("new-password-input");
		const confirmPasswordInput = getByTestId("confirm-password-input");
		const confirmButton = getByText("Confirm Reset");

		fireEvent.changeText(codeInput, "wrongCode");
		fireEvent.changeText(newPasswordInput, "newPassword");
		fireEvent.changeText(confirmPasswordInput, "newPassword");
		fireEvent.press(confirmButton);

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Password reset failed",
				"Please Try again.",
				[{ text: "OK" }],
				{ cancelable: false },
			);
		});
	});

	it("toggles new password visibility", () => {
		const { getByTestId } = render(<PasswordReset />);
		const newPasswordInput = getByTestId("new-password-input");
		const visibilityToggle = getByTestId("new-password-visibility-toggle");

		// Check initial state
		expect(newPasswordInput.props.secureTextEntry).toBe(true);

		// Toggle visibility
		fireEvent.press(visibilityToggle);
		expect(newPasswordInput.props.secureTextEntry).toBe(false);

		// Toggle visibility back
		fireEvent.press(visibilityToggle);
		expect(newPasswordInput.props.secureTextEntry).toBe(true);
	});

	it("toggles confirm password visibility", () => {
		const { getByTestId } = render(<PasswordReset />);
		const confirmPasswordInput = getByTestId("confirm-password-input");
		const visibilityToggle = getByTestId("confirm-password-visibility-toggle");

		// Check initial state
		expect(confirmPasswordInput.props.secureTextEntry).toBe(true);

		// Toggle visibility
		fireEvent.press(visibilityToggle);
		expect(confirmPasswordInput.props.secureTextEntry).toBe(false);

		// Toggle visibility back
		fireEvent.press(visibilityToggle);
		expect(confirmPasswordInput.props.secureTextEntry).toBe(true);
	});

	it("navigates back on back button press", () => {
		const { getByTestId } = render(<PasswordReset />);
		const backButton = getByTestId("back-button");

		fireEvent.press(backButton);
		expect(mockRouterBack).toHaveBeenCalled();
	});
});
