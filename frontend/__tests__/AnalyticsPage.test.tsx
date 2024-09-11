import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import AnalyticsPage from "../app/screens/analytics/AnalyticsPage"; // Update the import path accordingly
import AuthManagement from "../app/services/AuthManagement";
import { API_BASE_URL } from "../app/services/Utils";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

// Mock AuthManagement to return a fake token
jest.mock("../app/services/AuthManagement", () => ({
	getToken: jest.fn().mockResolvedValue("fake-token"),
}));

// Mock fetch to return a fake response
global.fetch = jest.fn(() =>
	Promise.resolve({
		json: () =>
			Promise.resolve({
				unique_visitors: { count: 100, percentage_change: 5 },
				returning_visitors: { count: 50, percentage_change: -2 },
				average_session_duration: { duration: 3600, percentage_change: 3 },
			}),
	}),
) as jest.Mock;

describe("AnalyticsPage", () => {
	const navigate = jest.fn();
	const goBack = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ navigate, back: goBack });
	});

	it("should render correctly", async () => {
		const { getByText, getByTestId } = render(<AnalyticsPage />);

		// Wait for the data to be fetched and rendered
		await waitFor(() => {
			expect(getByText("Key Metrics Summary")).toBeTruthy();
			expect(getByText("Unique Visitors")).toBeTruthy();
			// expect(getByText("Returning Visitors")).toBeTruthy();
			expect(getByText("Average Session Duration")).toBeTruthy();
		});

		// Check for presence of drawer button and back button
		expect(getByTestId("menu-button")).toBeTruthy();
		expect(getByTestId("back-button")).toBeTruthy();
	});

	it("should open and close the drawer", async () => {
		const { getByTestId, queryByText } = render(<AnalyticsPage />);

		// Ensure the drawer is initially closed
		expect(queryByText("Interactions Analytics")).toBeNull();

		// Open the drawer
		fireEvent.press(getByTestId("menu-button"));

		// Check if the drawer items are visible
		expect(await queryByText("Interactions Analytics")).toBeTruthy();

		// Close the drawer
		fireEvent.press(getByTestId("menu-button"));
		expect(queryByText("Interactions Analytics")).toBeNull();
	});

	it("should navigate back when back button is pressed", () => {
		const { getByTestId } = render(<AnalyticsPage />);

		fireEvent.press(getByTestId("back-button"));

		expect(goBack).toHaveBeenCalled();
	});

	it("should fetch and display data correctly", async () => {
		const { getByText } = render(<AnalyticsPage />);

		await waitFor(() => {
			// Check if the data is rendered correctly
			expect(getByText("Unique Visitors")).toBeTruthy();
			// expect(getByText("Returning Visitors")).toBeTruthy();
			expect(getByText("Average Session Duration")).toBeTruthy();
		});
	});
});
