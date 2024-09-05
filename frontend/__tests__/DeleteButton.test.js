/* eslint-disable no-undef */
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DeleteButton from "../app/components/DeleteButton"; // Adjust the import path if necessary

// Tests
describe("DeleteButton", () => {
	it("renders correctly with the given title", () => {
		const { getByText } = render(
			<DeleteButton title="Delete" onPress={() => {}} />,
		);

		// Check if the button title is rendered
		expect(getByText("Delete")).toBeTruthy();
	});

	it("calls the onPress function when pressed", () => {
		const onPressMock = jest.fn(); // Mock function
		const { getByText } = render(
			<DeleteButton title="Delete" onPress={onPressMock} />,
		);

		// Press the button
		fireEvent.press(getByText("Delete"));

		// Check if the onPressMock function was called
		expect(onPressMock).toHaveBeenCalled();
	});
});
