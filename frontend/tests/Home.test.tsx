import React from "react";
import { render } from "@testing-library/react-native";
import Home from "../app/screens/Home"; // Ensure the import path is correct

describe("Home", () => {
	it("renders correctly", () => {
		const tree = render(<Home />).toJSON();
		expect(tree).toMatchSnapshot();
	});
});
