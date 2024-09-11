import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CreateButton from "../app/components/CreateButton"; // Adjust the path according to your project structure

describe("CreateButton", () => {
	it("should render correctly with the given title", () => {
		const { getByText } = render(
			<CreateButton title="Create" onPress={() => {}} />,
		);

		// Check if the title is rendered correctly
		expect(getByText("Create")).toBeTruthy();
	});

	it("should call onPress when the button is pressed", () => {
		const mockOnPress = jest.fn();
		const { getByText } = render(
			<CreateButton title="Create" onPress={mockOnPress} />,
		);

		// Simulate pressing the button
		fireEvent.press(getByText("Create"));

		// Check if onPress is called once
		expect(mockOnPress).toHaveBeenCalledTimes(1);
	});
});
