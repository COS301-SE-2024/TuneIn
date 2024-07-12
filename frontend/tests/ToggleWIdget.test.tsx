import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import MyToggleWidget from "../app/components/ToggleWidget";

describe("MyToggleWidget component", () => {
	const toggleProps = {
		firstOption: "Option A",
		secondOption: "Option B",
		onChanged: jest.fn(), // Mock function to simulate onChanged callback
	};

	it("renders correctly with provided props", () => {
		const { getByText } = render(<MyToggleWidget {...toggleProps} />);

		// Assert first and second options are rendered
		expect(getByText("Option A")).toBeTruthy();
		expect(getByText("Option B")).toBeTruthy();
	});

	it("calls onChanged function with correct value when toggling", () => {
		const { getByText } = render(<MyToggleWidget {...toggleProps} />);

		// Simulate clicking on the second option
		fireEvent.press(getByText("Option B"));

		// Expect onChanged to be called with false (second option selected)
		expect(toggleProps.onChanged).toHaveBeenCalledWith(false);

		// Simulate clicking on the first option
		fireEvent.press(getByText("Option A"));

		// Expect onChanged to be called with true (first option selected)
		expect(toggleProps.onChanged).toHaveBeenCalledWith(true);
	});

	// Add more specific tests as needed for styling and other interactions
});
