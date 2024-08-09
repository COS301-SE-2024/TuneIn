import React from "react";
import { render } from "@testing-library/react-native";
import IconProgressCard from "../app/components/IconProgressCard"; // Adjust the path as needed

// Mocking the Entypo icon
jest.mock("@expo/vector-icons/Entypo", () => {
	return {
		__esModule: true,
		default: () => <></>, // Mock Entypo icon as an empty fragment
	};
});

// Mocking the ProgressBar
jest.mock("react-native-paper", () => {
	return {
		ProgressBar: () => <></>, // Mock ProgressBar as an empty fragment
	};
});

describe("IconProgressCard Component", () => {
	it("renders correctly with given props", () => {
		const props = {
			icon: "star", // Example icon name
			iconColor: "#FF0000", // Example color
			header: "Example Header",
			number: "123",
			progress: 0.5, // Example progress value
		};

		const { getByText } = render(<IconProgressCard {...props} />);

		// Check if the header and number are rendered
		expect(getByText(props.header)).toBeTruthy();
		expect(getByText(props.number)).toBeTruthy();

		// Check if the ProgressBar is rendered (it will be mocked)
		expect(() => getByText("Mocked ProgressBar")).toThrow(); // Ensure mocked content is not present
	});
});
