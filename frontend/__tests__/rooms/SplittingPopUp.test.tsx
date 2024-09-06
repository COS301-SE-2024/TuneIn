import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SplittingPopUp from "../../app/components/rooms/SplittingRoomPopUp"; // Update the import path as needed

// Mock animation or any asynchronous effect if it's there.
jest.mock("react-native-reanimated", () => {
	const Reanimated = require("react-native-reanimated/mock");

	// Mock the call to `runOnUI` to avoid asynchronous updates
	Reanimated.runOnUI = jest.fn((fn) => fn());
	return Reanimated;
});

describe("SplittingPopUp Component", () => {
	const mockOnClose = jest.fn();
	const mockOnConfirm = jest.fn().mockResolvedValue(undefined);

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly when visible", () => {
		const { getByText } = render(
			<SplittingPopUp
				isVisible={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		);

		// Check for the modal texts
		expect(getByText("Two Distinct Queues Detected")).toBeTruthy();
		expect(
			getByText(
				"We have noticed that there are two distinct queues. Do you want to create 2 branching rooms from the different queues?",
			),
		).toBeTruthy();
	});

	it("does not render when not visible", () => {
		const { queryByText } = render(
			<SplittingPopUp
				isVisible={false}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		);

		// Modal should not be visible when isVisible is false
		expect(queryByText("Two Distinct Queues Detected")).toBeNull();
	});

	it("calls onConfirm with true when 'Yes' button is pressed", async () => {
		const { getByText } = render(
			<SplittingPopUp
				isVisible={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		);

		// Find the "Yes, create rooms" button and simulate press
		const yesButton = getByText("Yes, create rooms");
		fireEvent.press(yesButton);

		// Wait for async actions to complete
		await waitFor(() => expect(mockOnConfirm).toHaveBeenCalledWith(true));
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("calls onConfirm with false when 'No' button is pressed", async () => {
		const { getByText } = render(
			<SplittingPopUp
				isVisible={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		);

		// Find the "No, cancel" button and simulate press
		const noButton = getByText("No, cancel");
		fireEvent.press(noButton);

		// Wait for async actions to complete
		await waitFor(() => expect(mockOnConfirm).toHaveBeenCalledWith(false));
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("calls onClose when modal request close is triggered", () => {
		const { getByTestId } = render(
			<SplittingPopUp
				isVisible={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
			/>,
		);

		// Modal should be closable when request close is triggered
		const modal = getByTestId("modal");
		fireEvent(modal, "requestClose");

		expect(mockOnClose).toHaveBeenCalled();
	});
});
