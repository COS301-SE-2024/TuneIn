import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import WelcomeScreen from "../app/screens/WelcomeScreen"; // Update this path accordingly

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

// // Mock Dimensions
// jest.mock("react-native", () => ({
// 	...jest.requireActual("react-native"),
// 	Dimensions: {
// 		get: jest.fn().mockReturnValue({ width: 375, height: 667 }), // You can adjust the dimensions as needed
// 	},
// }));

describe("WelcomeScreen", () => {
	const navigate = jest.fn();
	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ navigate });
	});

	it("should render correctly", () => {
		const { getByText } = render(<WelcomeScreen />);

		// Check if the buttons are rendered
		expect(getByText("Login")).toBeTruthy();
		expect(getByText("Register")).toBeTruthy();
	});

	it("should navigate to LoginScreen when Login button is pressed", () => {
		const { getByText } = render(<WelcomeScreen />);
		const loginButton = getByText("Login");

		fireEvent.press(loginButton);
		expect(navigate).toHaveBeenCalledWith("/screens/Auth/LoginOther");
	});

	it("should navigate to RegisterOther when Register button is pressed", () => {
		const { getByText } = render(<WelcomeScreen />);
		const registerButton = getByText("Register");

		fireEvent.press(registerButton);
		expect(navigate).toHaveBeenCalledWith("/screens/Auth/RegisterOther");
	});

	it("should navigate to HelpScreen when help button is pressed", () => {
		const { getByTestId } = render(<WelcomeScreen />);
		const helpButton = getByTestId("help-button"); // Add testID to the TouchableOpacity for the help button

		fireEvent.press(helpButton);
		expect(navigate).toHaveBeenCalledWith(
			"/screens/(tabs)/HelpScreenelpScreen",
		);
	});
});
