import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import VerifyEmailScreen from "../app/screens/Auth/VerifyEmail";
import { useRouter, useLocalSearchParams } from "expo-router";

import { Alert } from "react-native";

// Mocking useRouter and useLocalSearchParams from expo-router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
	useLocalSearchParams: jest.fn(),
}));

// Mock implementation for CognitoUser
jest.mock("amazon-cognito-identity-js", () => {
	const confirmRegistrationMock = jest.fn(
		(verificationCode, forceAliasCreation, callback) => {
			if (verificationCode === "correctCode") {
				callback(null, "SUCCESS");
			} else {
				callback({ message: "Invalid verification code" }, null);
			}
		},
	);

	return {
		CognitoUser: jest.fn().mockImplementation(() => ({
			confirmRegistration: confirmRegistrationMock,
		})),
		CognitoUserPool: jest.fn(),
	};
});

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

// Mock the Alert.alert method
jest.spyOn(Alert, "alert");

const mockRouterNavigate = jest.fn();
const mockRouterBack = jest.fn();

describe("VerifyEmailScreen", () => {
	beforeEach(() => {
		// Mocking the return values of useRouter and useLocalSearchParams
		(useRouter as jest.Mock).mockReturnValue({
			navigate: mockRouterNavigate,
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
		const { getByText, getByPlaceholderText } = render(<VerifyEmailScreen />);
		expect(getByText("Verify Your Email")).toBeTruthy();
		expect(getByPlaceholderText("Enter the verification code")).toBeTruthy();
	});

	// it("handles successful verification", async () => {
	// 	const { getByText, getByPlaceholderText } = render(<VerifyEmailScreen />);
	// 	const codeInput = getByPlaceholderText("Enter the verification code");
	// 	const verifyButton = getByText("VERIFY");

	// 	fireEvent.changeText(codeInput, "correctCode");
	// 	fireEvent.press(verifyButton);

	// 	await waitFor(() => {
	// 		expect(Alert.alert).toHaveBeenCalledWith(
	// 			"Success!",
	// 			"Verification successful",
	// 			[{ text: "OK" }],
	// 			{ cancelable: false },
	// 		);
	// 		expect(mockRouterNavigate).toHaveBeenCalledWith("/screens/SpotifyAuth");
	// 	});
	// });

	it("handles failed verification", async () => {
		const { getByText, getByPlaceholderText } = render(<VerifyEmailScreen />);
		const codeInput = getByPlaceholderText("Enter the verification code");
		const verifyButton = getByText("VERIFY");

		fireEvent.changeText(codeInput, "wrongCode");
		fireEvent.press(verifyButton);

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				"Error",
				"Invalid verification code",
				[{ text: "OK" }],
				{ cancelable: false },
			);
		});
	});

	it("navigates back on back button press", () => {
		const { getByTestId } = render(<VerifyEmailScreen />);
		const backButton = getByTestId("back-button");

		fireEvent.press(backButton);
		expect(mockRouterBack).toHaveBeenCalled();
	});
});
