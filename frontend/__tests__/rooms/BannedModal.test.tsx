import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import BannedModal from "../../app/components/BannedModal"; // Update the path accordingly
import { useNavigation } from "@react-navigation/native";

// Mock the navigation
jest.mock("@react-navigation/native", () => ({
	useNavigation: jest.fn(),
}));

describe("BannedModal Component", () => {
	const mockNavigate = jest.fn();
	const mockOnClose = jest.fn();

	beforeEach(() => {
		(useNavigation as jest.Mock).mockReturnValue({
			goBack: mockNavigate,
		});
	});

	it("renders the modal with correct text", () => {
		const { getByText } = render(
			<BannedModal visible={true} onClose={mockOnClose} />,
		);

		// Check if modal text is displayed
		expect(getByText("You Have Been Banned")).toBeTruthy();
		expect(
			getByText(
				"The host has banned you from this room. You can no longer interact with this room or its participants.",
			),
		).toBeTruthy();
	});

	it("calls navigation and onClose when 'Okay' button is pressed", () => {
		const { getByTestId } = render(
			<BannedModal visible={true} onClose={mockOnClose} />,
		);

		// Press the back button (the 'Okay' button)
		fireEvent.press(getByTestId("back-button"));

		// Check if navigation.goBack was called
		expect(mockNavigate).toHaveBeenCalled();

		// Check if onClose was called
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("does not render the modal when not visible", () => {
		const { queryByText } = render(
			<BannedModal visible={false} onClose={mockOnClose} />,
		);

		// Ensure modal is not rendered
		expect(queryByText("You Have Been Banned")).toBeFalsy();
	});
});
