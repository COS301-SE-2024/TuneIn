// CreateRoom.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CreateRoom from "../app/screens/rooms/CreateRoom"; // Adjust the import path accordingly
import { useNavigation } from "expo-router";

// Mock useNavigation from expo-router
jest.mock("expo-router", () => {
	const actualModule = jest.requireActual("expo-router");
	return {
		...actualModule,
		useNavigation: jest.fn(),
	};
});

describe("<CreateRoom />", () => {
	it("calls goBack when Go Back button is pressed", () => {
		const goBack = jest.fn();
		(useNavigation as jest.Mock).mockReturnValue({ goBack });

		const { getByText } = render(<CreateRoom />);

		const goBackButton = getByText("×");
		fireEvent.press(goBackButton);

		expect(goBack).toHaveBeenCalled();
	});
});
