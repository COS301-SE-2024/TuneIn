import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import NsfwModal from "../../app/components/NsfwModal"; // Adjust the path if necessary

describe("NsfwModal", () => {
	const onProceedMock = jest.fn();
	const onExitMock = jest.fn();

	const defaultProps = {
		visible: true,
		onProceed: onProceedMock,
		onExit: onExitMock,
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly when visible", () => {
		const { getByText } = render(<NsfwModal {...defaultProps} />);

		// Check if the modal title and text are rendered
		expect(getByText("NSFW Content Warning")).toBeTruthy();
		expect(
			getByText(
				"This room is marked as NSFW. Are you sure you want to continue?",
			),
		).toBeTruthy();
	});

	it("calls onProceed when the 'Yes, Stay' button is pressed", () => {
		const { getByText } = render(<NsfwModal {...defaultProps} />);

		const proceedButton = getByText("Yes, Stay");
		fireEvent.press(proceedButton);

		expect(onProceedMock).toHaveBeenCalledTimes(1);
	});

	it("calls onExit when the 'No, Leave' button is pressed", () => {
		const { getByText } = render(<NsfwModal {...defaultProps} />);

		const exitButton = getByText("No, Leave");
		fireEvent.press(exitButton);

		expect(onExitMock).toHaveBeenCalledTimes(1);
	});

	it("calls onExit when the modal background is pressed", () => {
		const { getByTestId } = render(<NsfwModal {...defaultProps} />);

		// Assuming you add a testID to modalContainer
		fireEvent.press(getByTestId("modal-container"));

		expect(onExitMock).toHaveBeenCalledTimes(1);
	});

	it("does not render the modal when visible is false", () => {
		const { queryByText } = render(
			<NsfwModal {...defaultProps} visible={false} />,
		);

		// Check that the modal is not rendered
		expect(queryByText("NSFW Content Warning")).toBeNull();
	});
});
