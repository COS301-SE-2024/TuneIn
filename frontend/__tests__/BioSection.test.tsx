import React from "react";
import { render } from "@testing-library/react-native";
import BioSection from "../app/components/BioSection"; // Adjust the import path as necessary

describe("BioSection", () => {
	it("renders correctly with the given content", () => {
		const testContent = "This is a test bio content.";

		const { getByText } = render(<BioSection content={testContent} />);

		// Check if the title "Bio" is rendered
		expect(getByText("Bio")).toBeTruthy();

		// Check if the content is rendered correctly
		expect(getByText(testContent)).toBeTruthy();
	});
});
