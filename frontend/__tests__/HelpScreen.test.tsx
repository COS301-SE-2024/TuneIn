import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import HelpMenu from "../app/screens/help/HelpScreen"; // Adjust the import path as needed

jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

const mockNavigate = jest.fn();
const mockBack = jest.fn();

describe("HelpMenu", () => {
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
		const { getByTestId, getAllByTestId } = render(<HelpMenu />);

		// Check if the title is rendered
		expect(getByTestId("title")).toBeTruthy();

		// Check if the back button is rendered
		expect(getByTestId("backButton")).toBeTruthy();
	});

	test("navigates to the correct screen when a menu item is pressed", () => {
		const { getByTestId } = render(<HelpMenu />);

		// Simulate pressing a menu item
		fireEvent.press(getByTestId("menuItem-0")); // Adjust index if needed

		expect(mockNavigate).toHaveBeenCalledWith("/screens/help/GettingStarted");
	});

	test("navigates to the correct screen when a subcategory is pressed", () => {
		const { getByText } = render(<HelpMenu />);

		// Simulate pressing a subcategory item
		fireEvent.press(getByText("Introduction"));

		expect(mockNavigate).toHaveBeenCalledWith("/screens/help/GettingStarted");
	});

	test("goes back when the back button is pressed", () => {
		const { getByTestId } = render(<HelpMenu />);

		// Simulate pressing the back button
		fireEvent.press(getByTestId("backButton"));

		expect(mockBack).toHaveBeenCalled();
	});
});
