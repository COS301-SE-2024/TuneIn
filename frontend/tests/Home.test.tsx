import React from "react";
import { render } from "@testing-library/react-native";
import Home from "../app/screens/Home"; // Ensure the import path is correct
import auth from "../app/services/AuthManagement";
import axios from "axios";

jest.mock("expo-font", () => ({
	...jest.requireActual("expo-font"),
	loadAsync: jest.fn(),
}));

jest.mock("expo-asset", () => ({
	...jest.requireActual("expo-asset"),
	fromModule: jest.fn(() => ({
		downloadAsync: jest.fn(),
		uri: "mock-uri",
	})),
}));

jest.mock("axios");

jest.mock("../app/services/AuthManagement", () => ({
	__esModule: true,
	default: {
		getToken: jest.fn(), // Mock getToken method
	},
}));

describe("Home", () => {
	it("renders correctly", () => {
		(axios.get as jest.Mock).mockResolvedValueOnce(/*Expected API Response*/);
		(auth.getToken as jest.Mock).mockReturnValue("token"); // Mock the token for the test
		const tree = render(<Home />).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
