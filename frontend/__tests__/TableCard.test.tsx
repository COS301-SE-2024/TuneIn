import React from "react";
import { render } from "@testing-library/react-native";
import TableCard from "../app/components/TableCard"; // Adjust the path as needed

describe("TableCard Component", () => {
	const defaultProps = {
		title: "Sample Table",
		headers: ["Header 1", "Header 2", "Header 3"],
		data: [
			["Row 1 Cell 1", "Row 1 Cell 2", "Row 1 Cell 3"],
			["Row 2 Cell 1", "Row 2 Cell 2", "Row 2 Cell 3"],
			["Row 3 Cell 1", "Row 3 Cell 2", "Row 3 Cell 3"],
		],
	};

	it("renders correctly with provided props", () => {
		const { getByText } = render(<TableCard {...defaultProps} />);

		// Check if the title is displayed
		expect(getByText("Sample Table")).toBeTruthy();

		// Check if the headers are displayed
		defaultProps.headers.forEach((header) => {
			expect(getByText(header)).toBeTruthy();
		});

		// Check if the data is displayed correctly
		defaultProps.data.flat().forEach((cell) => {
			expect(getByText(cell)).toBeTruthy();
		});
	});

	it("renders correctly with different data", () => {
		const props = {
			title: "Another Table",
			headers: ["A", "B", "C"],
			data: [
				["1", "2", "3"],
				["4", "5", "6"],
				["7", "8", "9"],
			],
		};

		const { getByText } = render(<TableCard {...props} />);

		// Check if the title is displayed
		expect(getByText("Another Table")).toBeTruthy();

		// Check if the headers are displayed
		props.headers.forEach((header) => {
			expect(getByText(header)).toBeTruthy();
		});

		// Check if the data is displayed correctly
		props.data.flat().forEach((cell) => {
			expect(getByText(cell)).toBeTruthy();
		});
	});
});
