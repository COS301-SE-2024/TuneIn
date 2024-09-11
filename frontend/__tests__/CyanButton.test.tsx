import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CyanButton from "../app/components/CyanButton"; // Adjust the path accordingly

describe("CyanButton", () => {
	it("renders correctly with the given title", () => {
		const { getByText } = render(
			<CyanButton title="Press Me" onPress={jest.fn()} />,
		);

		// Check if the title is rendered correctly
		expect(getByText("Press Me")).toBeTruthy();
	});

	it("calls the onPress function when pressed", () => {
		const onPressMock = jest.fn();
		const { getByText } = render(
			<CyanButton title="Press Me" onPress={onPressMock} />,
		);

		// Simulate pressing the button
		fireEvent.press(getByText("Press Me"));

		// Verify if the onPress function has been called
		expect(onPressMock).toHaveBeenCalled();
	});
});
