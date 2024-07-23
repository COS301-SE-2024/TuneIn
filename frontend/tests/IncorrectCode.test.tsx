import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import IncorrectCodeScreen from "../app/screens/Auth/IncorrectCode";

// Mock useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn().mockReturnValue({
		navigate: jest.fn(),
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

describe("IncorrectCodeScreen", () => {
	it("renders correctly", () => {
		const { getByText } = render(<IncorrectCodeScreen />);

		// Assert screen elements are rendered correctly
		expect(getByText("Verification Code Incorrect")).toBeTruthy();
		expect(getByText("Would you like us to send you a new code?")).toBeTruthy();
		expect(getByText("RESEND CODE")).toBeTruthy();
	});

	it("navigates to OTP screen when RESEND CODE button is pressed", () => {
		const { getByText } = render(<IncorrectCodeScreen />);

		// Simulate click on RESEND CODE button
		const resendCodeButton = getByText("RESEND CODE");
		fireEvent.press(resendCodeButton);

		// Assert useRouter navigate function is called with correct pathname
		expect(require("expo-router").useRouter().navigate).toHaveBeenCalledTimes(
			1,
		);
		expect(require("expo-router").useRouter().navigate).toHaveBeenCalledWith(
			"/screens/Auth/OTP",
		);
	});

	it("navigates back when back button is pressed", () => {
		const { getByTestId } = render(<IncorrectCodeScreen />);

		// Simulate click on back button
		const backButton = getByTestId("back-button");
		fireEvent.press(backButton);

		// Assert useRouter back function is called
		expect(require("expo-router").useRouter().back).toHaveBeenCalledTimes(1);
	});
});
