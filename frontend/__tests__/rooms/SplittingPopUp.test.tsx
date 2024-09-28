import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SplittingPopUp from "../../app/components/rooms/SplittingRoomPopUp"; // Adjust the path accordingly

describe("SplittingPopUp Component", () => {
	const mockOnClose = jest.fn();
	const mockOnConfirm = jest.fn(() => Promise.resolve());

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly when visible", () => {
		const { getByTestId, getByText } = render(
			<SplittingPopUp
				isVisible={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
				genres={["Rock", "Pop"]}
			/>,
		);

		expect(getByTestId("modal")).toBeTruthy(); // Modal should be visible
		expect(getByText("Two Distinct Queues Detected")).toBeTruthy(); // Popup title
		expect(getByText("Yes, create rooms")).toBeTruthy(); // Yes button
		expect(getByText("No, cancel")).toBeTruthy(); // No button
	});

	it('calls onConfirm with true when "Yes, create rooms" is pressed', async () => {
		const { getByText } = render(
			<SplittingPopUp
				isVisible={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
				genres={["Rock", "Pop"]}
			/>,
		);

		fireEvent.press(getByText("Yes, create rooms"));

		await waitFor(() => {
			expect(mockOnConfirm).toHaveBeenCalledWith(true);
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	it('calls onConfirm with false when "No, cancel" is pressed', async () => {
		const { getByText } = render(
			<SplittingPopUp
				isVisible={true}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
				genres={["Rock", "Pop"]}
			/>,
		);

		fireEvent.press(getByText("No, cancel"));

		await waitFor(() => {
			expect(mockOnConfirm).toHaveBeenCalledWith(false);
			expect(mockOnClose).toHaveBeenCalled();
		});
	});

	it("does not render when isVisible is false", () => {
		const { queryByTestId } = render(
			<SplittingPopUp
				isVisible={false}
				onClose={mockOnClose}
				onConfirm={mockOnConfirm}
				genres={["Rock", "Pop"]}
			/>,
		);

		expect(queryByTestId("modal")).toBeNull(); // Modal should not be rendered
	});
});
