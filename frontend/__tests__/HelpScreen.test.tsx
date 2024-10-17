import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import HelpMenu from "../app/screens/(tabs)/HelpScreen"; // Adjust the import path as needed

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
		const { getByTestId } = render(<HelpMenu />);

		// Check if the title is rendered
		expect(getByTestId("title")).toBeTruthy();
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

	// New test: Check if feedback section is rendered
	test("renders feedback section correctly", () => {
		const { getByPlaceholderText } = render(<HelpMenu />);

		// Check if the feedback input is rendered
		expect(
			getByPlaceholderText("Describe your issue or feedback..."),
		).toBeTruthy();
	});

	// New test: Sends feedback successfully when the message is not empty
	test("shows success modal when feedback is sent", () => {
		const { getByTestId, getByPlaceholderText, getByText } = render(
			<HelpMenu />,
		);

		// Enter feedback in the input
		fireEvent.changeText(
			getByPlaceholderText("Describe your issue or feedback..."),
			"Test feedback",
		);

		// Simulate pressing the send feedback button
		fireEvent.press(getByTestId("sendMessageButton"));

		// Check if success message is displayed in modal
		expect(
			getByText("Thank you for your feedback! We will get back to you soon."),
		).toBeTruthy();
	});

	// New test: Shows error modal when no feedback is entered
	test("shows error modal when feedback is empty", () => {
		const { getByTestId, getByText } = render(<HelpMenu />);

		// Simulate pressing the send feedback button without entering feedback
		fireEvent.press(getByTestId("sendMessageButton"));

		// Check if error message is displayed in modal
		expect(getByText("Please enter a message before sending.")).toBeTruthy();
	});

	// New test: Closes modal when OK button is pressed
	test("closes modal when OK button is pressed", () => {
		const { getByTestId, getByText, queryByText } = render(<HelpMenu />);

		// Simulate pressing the send feedback button without entering feedback
		fireEvent.press(getByTestId("sendMessageButton"));

		// Simulate pressing the OK button on the modal
		fireEvent.press(getByText("OK"));

		// Check if modal is closed
		expect(queryByText("Please enter a message before sending.")).toBeNull();
	});
});
