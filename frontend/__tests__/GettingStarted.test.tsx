import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GettingStarted from "../app/screens/help/GettingStarted";
import { useRouter } from "expo-router";

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("GettingStarted", () => {
	const mockNavigate = jest.fn();
	const mockBack = jest.fn();

	beforeEach(() => {
		useRouter.mockReturnValue({
			navigate: mockNavigate,
			back: mockBack,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("renders correctly", () => {
		const { getByTestId, getByText } = render(<GettingStarted />);

		// Check if the header and title are rendered
		expect(getByTestId("back-button")).toBeTruthy();
		expect(getByText("Getting Started")).toBeTruthy();

		// Check if the Introduction card is rendered
		expect(getByText("Introduction")).toBeTruthy();

		// Check if the About card is rendered
		expect(getByText("About")).toBeTruthy();

		// Check if the Creating an Account card is rendered
		expect(getByText("Creating an Account")).toBeTruthy();

		// Check if the Logging In card is rendered
		expect(getByText("Logging In")).toBeTruthy();
	});

	test("navigates to the correct screen when login card is pressed", () => {
		const { getByText } = render(<GettingStarted />);

		fireEvent.press(getByText("Logging In"));
	});

	test("navigates to the correct screen when register card is pressed", () => {
		const { getByText } = render(<GettingStarted />);

		fireEvent.press(getByText("Creating an Account"));
	});

	test("goes back when the back button is pressed", () => {
		const { getByTestId } = render(<GettingStarted />);

		fireEvent.press(getByTestId("back-button"));

		expect(mockBack).toHaveBeenCalled();
	});
});
