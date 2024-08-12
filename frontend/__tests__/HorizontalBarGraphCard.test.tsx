import React from "react";
import { render } from "@testing-library/react-native";
import HorizontalBarGraphCard from "../app/components/HorizontalBarGraphCard"; // Adjust the path as needed
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

jest.mock("react-native-chart-kit", () => ({
	BarChart: jest.fn(() => null), // Mock the BarChart component
}));

describe("HorizontalBarGraphCard Component", () => {
	const defaultProps = {
		data: [
			{ label: "A", value: 10 },
			{ label: "B", value: 20 },
		],
		title: "Sample Chart",
		unit: "number" as "number", // Type assertion to match the expected type
	};

	it("renders correctly with provided props", () => {
		const { getByText } = render(<HorizontalBarGraphCard {...defaultProps} />);

		// Check if the title is displayed
		expect(getByText("Sample Chart")).toBeTruthy();

		// Check if the formatted total value is displayed
		expect(getByText("30")).toBeTruthy(); // Total of 10 + 20

		// Verify if the BarChart component is rendered
		expect(BarChart).toHaveBeenCalledWith(
			expect.objectContaining({
				data: {
					labels: ["A", "B"],
					datasets: [
						{
							data: [10, 20],
						},
					],
				},
				width: Dimensions.get("window").width - 40,
				height: 220,
			}),
			expect.anything(),
		);
	});

	it('formats the total value correctly when unit is "minutes"', () => {
		const props = {
			...defaultProps,
			unit: "minutes" as "minutes", // Type assertion to match the expected type
			data: [
				{ label: "A", value: 90 }, // 1h 30m
				{ label: "B", value: 30 }, // 30m
			],
		};

		const { getByText } = render(<HorizontalBarGraphCard {...props} />);

		// Check if the formatted total value in hours and minutes is displayed
		expect(getByText("2h 0m")).toBeTruthy(); // Total of 120 minutes
	});
});
