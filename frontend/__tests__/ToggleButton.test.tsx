import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ToggleButton from "../app/components/ToggleButton";

describe("ToggleButton Component", () => {
	const label = "Test Label";

	const renderToggleButton = (props = {}) => {
		return render(<ToggleButton label={label} {...props} />);
	};

	test("should render correctly with initial label", () => {
		const { getByText } = renderToggleButton();
		expect(getByText(label)).toBeTruthy();
	});

	test("should toggle to input field on press", () => {
		const { getByText, getByPlaceholderText } = renderToggleButton();

		// Press to toggle to input field
		fireEvent.press(getByText(label));
		expect(getByPlaceholderText(`Enter ${label}`)).toBeTruthy();
	});

	test("should toggle back to label on second press", () => {
		const { getByText, getByPlaceholderText, queryByPlaceholderText } =
			renderToggleButton();

		// Toggle to input field
		fireEvent.press(getByText(label));
		const inputField = getByPlaceholderText(`Enter ${label}`);
		expect(inputField).toBeTruthy();

		// Enter text in input field
		fireEvent.changeText(inputField, "Sample Text");

		// Toggle back to label
		fireEvent.press(inputField);
		expect(getByText(label)).toBeTruthy();

		// Check the value of the input field before it is unmounted
		expect(queryByPlaceholderText(`Enter ${label}`)).toBeNull();
	});
});
