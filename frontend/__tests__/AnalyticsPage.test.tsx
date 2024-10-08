import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AnalyticsPage from "../app/screens/analytics/AnalyticsPage"; // Update the import path accordingly
import { ToastAndroid } from "react-native";

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
		(AsyncStorage.getItem as jest.Mock).mockClear();
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
		const { getByTestId, queryByTestId } = render(<AnalyticsPage />);

		// Ensure the drawer is initially closed
		expect(queryByTestId("interaction-analytics")).toBeNull();

		// Open the drawer
		fireEvent.press(getByTestId("menu-button"));

		await waitFor(async () => {
			const text = await queryByTestId("interaction-analytics");

			// Check if the drawer items are visible
			expect(text).toBeTruthy();
		});

		// Close the drawer
		fireEvent.press(getByTestId("menu-button"));
		expect(queryByTestId("interaction-analytics")).toBeNull();
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

	it("logs failure to fetch and display data correctly", async () => {
		global.fetch = jest.fn(
			() => Promise.reject(new Error("Network error")), // Simulate network error
		);
		const toastSpy = jest
			.spyOn(ToastAndroid, "show")
			.mockImplementation(() => {});

		const {} = render(<AnalyticsPage />);

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(
				"Failed to load analytics",
				ToastAndroid.SHORT,
			);
		});

		// Restore the original ToastAndroid.show implementation
		toastSpy.mockRestore();
	});
});
