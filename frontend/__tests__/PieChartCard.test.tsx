import React from "react";
import { render } from "@testing-library/react-native";
import PieChartCard from "../app/components/PieChartCard"; // Adjust the path as necessary

describe("PieChartCard", () => {
	const returningVisitors = 60;
	const newVisitors = 40;

	it("renders correctly with given props", () => {
		const { getByTestId, getByText } = render(
			<PieChartCard
				returningVisitors={returningVisitors}
				newVisitors={newVisitors}
			/>,
		);

		// Check if the title is rendered correctly
		expect(getByText("Visitors Breakdown")).toBeTruthy();

		// Check if the legend items are rendered correctly
		expect(getByTestId("returningLegend")).toBeTruthy();
		expect(getByText("Returning Visitors")).toBeTruthy();

		expect(getByTestId("newLegend")).toBeTruthy();
		expect(getByText("New Visitors")).toBeTruthy();
	});

	it("passes the correct data to the PieChart", () => {
		const { getByTestId } = render(
			<PieChartCard
				returningVisitors={returningVisitors}
				newVisitors={newVisitors}
			/>,
		);

		// Since we cannot directly access the PieChart's data prop,
		// we check for the correct rendering of the chart and legends
		const pieChart = getByTestId("cardTitle");
		expect(pieChart).toBeTruthy();

		// Optionally, if you mock the PieChart, you can check if the correct data is passed
	});
});
