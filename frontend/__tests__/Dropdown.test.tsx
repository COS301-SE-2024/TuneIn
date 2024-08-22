import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Dropdown from "../app/components/Dropdown";

describe("Dropdown Component", () => {
	const options = ["Option 1", "Option 2", "Option 3"];
	const placeholder = "Select an option";

	const renderDropdown = (props = {}) => {
		const defaultProps = {
			options,
			placeholder,
			onSelect: jest.fn(),
			selectedOption: null,
			setSelectedOption: jest.fn(),
		};
		return render(<Dropdown {...defaultProps} {...props} />);
	};

	test("should display placeholder text correctly", () => {
		const { getByText } = renderDropdown();
		expect(getByText(placeholder)).toBeTruthy();
	});

	test("should open and close modal on press", () => {
		const { getByText, getByPlaceholderText, queryByPlaceholderText } =
			renderDropdown();

		// Open modal
		fireEvent.press(getByText(placeholder));
		expect(
			getByPlaceholderText(`Search ${placeholder.toLowerCase()}...`),
		).toBeTruthy();

		// Close modal
		fireEvent.press(getByText("Close"));
		expect(
			queryByPlaceholderText(`Search ${placeholder.toLowerCase()}...`),
		).toBeNull();
	});

	test("should filter options based on search query", () => {
		// const { getByText, getByPlaceholderText, getByTestId } = renderDropdown();
		// // Open modal
		// fireEvent.press(getByText(placeholder));
		// // Enter search query
		// const searchInput = getByPlaceholderText(
		// 	`Search ${placeholder.toLowerCase()}...`,
		// );
		// fireEvent.changeText(searchInput, "Option 1");
		// // Check filtered results
		// expect(getByTestId("flat-list").props.data).toEqual(["Option 1"]);
	});

	// test("should select an option correctly", async () => {
	// 	const onSelect = jest.fn();
	// 	const setSelectedOption = jest.fn();
	// 	const { getByText, getByPlaceholderText, queryByText, debug } =
	// 		renderDropdown({ onSelect, setSelectedOption });

	// 	// Open modal
	// 	fireEvent.press(getByText(placeholder));

	// 	// Ensure modal is open and search input is present
	// 	expect(
	// 		getByPlaceholderText(`Search ${placeholder.toLowerCase()}...`),
	// 	).toBeTruthy();

	// 	// Debug the component tree before selection
	// 	debug();

	// 	// Select an option
	// 	fireEvent.press(getByText("Option 1"));

	// 	// Debug the component tree after selection
	// 	debug();

	// 	// Check if the option is selected and modal is closed
	// 	await waitFor(() => {
	// 		expect(setSelectedOption).toHaveBeenCalledWith("Option 1");
	// 		expect(onSelect).toHaveBeenCalledWith("Option 1");
	// 	});

	// 	// Wait for the selected option to appear
	// 	await waitFor(() => {
	// 		expect(queryByText("Option 1")).toBeTruthy();
	// 	});

	// 	// Verify the modal is closed
	// 	expect(queryByText(`Search ${placeholder.toLowerCase()}...`)).toBeNull();
	// });
});
