import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import InteractionsAnalytics from "../app/screens/analytics/InteractionsAnalytics";
import { useRouter } from "expo-router";

// Mock the useRouter hook
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

describe("InteractionsAnalytics", () => {
	const routerBack = jest.fn();
	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ back: routerBack });
		jest.clearAllTimers();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly", () => {
		const { toJSON } = render(<InteractionsAnalytics />);
		expect(toJSON()).toMatchSnapshot();
	});

	it("calls router.back() when back button is pressed", async () => {
		const { getByTestId } = render(<InteractionsAnalytics />);

		await act(async () => {
			fireEvent.press(getByTestId("back-button"));
		});

		await waitFor(() => expect(routerBack).toHaveBeenCalled());
	});

	it("passes the correct data to LineGraphCard", async () => {
		const { getByText } = render(<InteractionsAnalytics />);
		await waitFor(() => expect(getByText("Daily Messages")).toBeTruthy());
	});

	it("passes the correct data to IconProgressCard", async () => {
		const { getByText } = render(<InteractionsAnalytics />);
		await waitFor(() => {
			expect(getByText("Messages")).toBeTruthy();
			expect(getByText("15%")).toBeTruthy();
			expect(getByText("Reactions")).toBeTruthy();
			expect(getByText("85%")).toBeTruthy();
		});
	});

	it("passes the correct data to TableCard", async () => {
		const { getByText } = render(<InteractionsAnalytics />);
		await waitFor(() => {
			expect(getByText("Top Playlist Contributors")).toBeTruthy();
			expect(getByText("User A")).toBeTruthy();
			expect(getByText("50")).toBeTruthy();
			expect(getByText("200")).toBeTruthy();
		});
	});
});
