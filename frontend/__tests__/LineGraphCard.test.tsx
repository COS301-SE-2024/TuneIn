import React from "react";
import { render } from "@testing-library/react-native";
import LineGraphCard from "../app/components/LineGraphCard"; // Adjust the path as needed

// Mocking the LineChart component
jest.mock("react-native-chart-kit", () => {
	return {
		LineChart: () => <></>, // Return an empty fragment as a mock
	};
});

describe("LineGraphCard Component", () => {
	it("renders correctly with given props", () => {
		const testData = [10, 20, 30, 40, 50, 60, 70];
		const testTitle = "Test Line Graph";

		const { getByText } = render(
			<LineGraphCard data={testData} title={testTitle} />,
		);

		// Check if the title is rendered
		expect(getByText(testTitle)).toBeTruthy();

		// Check if the LineChart is rendered (it will be mocked)
		expect(() => getByText("Mocked LineChart")).toThrow(); // Ensure mocked content is not present
	});
});
