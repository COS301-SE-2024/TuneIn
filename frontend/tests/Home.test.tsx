import React from "react";
import { render } from "@testing-library/react-native";
import Home from "../app/screens/Home"; // Ensure the import path is correct
import auth from "../app/services/AuthManagement";

jest.mock("../app/services/AuthManagement", () => ({
	__esModule: true,
	default: {
		getToken: jest.fn(), // Mock getToken method
	},
}));

describe("Home", () => {
	it("renders correctly", () => {
		(auth.getToken as jest.Mock).mockReturnValue("token"); // Mock the token for the test
		const tree = render(<Home />).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
