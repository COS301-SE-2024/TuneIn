import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DatePicker from "../app/components/DatePicker";

describe("DatePicker", () => {
	const mockOnPress = jest.fn();

	test("renders correctly with default text", () => {
		const { getByText } = render(
			<DatePicker selectedOption={null} onPress={mockOnPress} />,
		);
		const defaultText = getByText("Start Date");
		expect(defaultText).toBeTruthy();
	});

	test("renders correctly with a selected date", () => {
		const mockDate = new Date(2024, 8, 11); // Example date
		const { getByText } = render(
			<DatePicker selectedOption={mockDate} onPress={mockOnPress} />,
		);
		const dateText = getByText(mockDate.toLocaleString());
		expect(dateText).toBeTruthy();
	});

	test("calls onPress when pressed", () => {
		const { getByText } = render(
			<DatePicker selectedOption={null} onPress={mockOnPress} />,
		);
		const touchable = getByText("Start Date").parent;
		fireEvent.press(touchable);
		expect(mockOnPress).toHaveBeenCalled();
	});

	// test("applies active filter style when selectedOption is provided", () => {
	// 	const { getByText } = render(
	// 		<DatePicker selectedOption={new Date()} onPress={mockOnPress} />,
	// 	);
	// 	const touchable = getByText(/Start Date/i).parent;
	// 	expect(touchable).toHaveStyle({ backgroundColor: "some_primary_color" }); // Replace 'some_primary_color' with the actual primary color used
	// });
});
