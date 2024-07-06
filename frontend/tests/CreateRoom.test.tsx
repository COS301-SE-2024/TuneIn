// CreateRoom.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CreateRoom from "../app/screens/CreateRoom"; // Adjust the import path accordingly
import { useNavigation } from "expo-router";

// Mock useNavigation from expo-router
jest.mock("expo-router", () => ({
	useNavigation: jest.fn(),
}));

describe("<CreateRoom />", () => {
	it("calls goBack when Go Back button is pressed", () => {
		const goBack = jest.fn();
		(useNavigation as jest.Mock).mockReturnValue({ goBack });

		const { getByText } = render(<CreateRoom />);

		const goBackButton = getByText("Go Back");
		fireEvent.press(goBackButton);

		expect(goBack).toHaveBeenCalled();
	});
});
