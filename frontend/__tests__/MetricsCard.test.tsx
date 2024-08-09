import React from "react";
import { render } from "@testing-library/react-native";
import MetricsCard from "../app/components/MetricsCard"; // Adjust the path as needed
import { colors } from "../app/styles/colors"; // Adjust the path as needed

describe("MetricsCard Component", () => {
	const defaultProps = {
		title: "Metric Title",
		number: "1234",
		percentage: "+5%",
	};

	it("renders correctly with positive percentage", () => {
		const { getByText, getByTestId } = render(
			<MetricsCard {...defaultProps} />,
		);

		// Check if the title is displayed
		expect(getByText("Metric Title")).toBeTruthy();

		// Check if the number is displayed
		expect(getByText("1234")).toBeTruthy();

		// Check if the positive percentage is displayed correctly
		const percentageText = getByText("+5%");
		expect(percentageText).toBeTruthy();
		expect(percentageText.props.style).toContainEqual(
			expect.objectContaining({ color: colors.secondary }),
		);
	});

	it("renders correctly with negative percentage", () => {
		const props = { ...defaultProps, percentage: "-5%" };
		const { getByText } = render(<MetricsCard {...props} />);

		// Check if the negative percentage is displayed correctly
		const percentageText = getByText("-5%");
		expect(percentageText).toBeTruthy();
		expect(percentageText.props.style).toContainEqual(
			expect.objectContaining({ color: colors.secondary }),
		);
	});
});
