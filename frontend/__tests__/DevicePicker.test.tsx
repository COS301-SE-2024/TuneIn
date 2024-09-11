import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import DevicePicker from "../app/components/DevicePicker"; // Adjust the path to your component
import { useSpotifyDevices } from "../app/hooks/useSpotifyDevices";
import * as spotifyAuth from "../app/services/SpotifyAuth";

// Mocking hooks and services
jest.mock("../app/hooks/useSpotifyDevices");
jest.mock("../app/services/SpotifyAuth");

describe("DevicePicker Component", () => {
	const mockGetDeviceIDs = jest.fn();
	const mockGetTokens = jest.fn();
	const mockDevices = [
		{ id: "1", name: "Phone", type: "Smartphone", is_active: true },
		{ id: "2", name: "Laptop", type: "Computer", is_active: false },
	];

	beforeEach(() => {
		(useSpotifyDevices as jest.Mock).mockReturnValue({
			getDeviceIDs: mockGetDeviceIDs,
			devices: mockDevices,
			error: null,
		});
		mockGetTokens.mockResolvedValue({ access_token: "mockAccessToken" });
		(spotifyAuth.getTokens as jest.Mock).mockImplementation(mockGetTokens);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("renders the device picker button", () => {
		const { getByTestId } = render(<DevicePicker />);
		const speakerButton = getByTestId("Speaker-button");
		expect(speakerButton).toBeTruthy();
	});

	test("opens and closes the modal", async () => {
		const { getByTestId, getByText, queryByText } = render(<DevicePicker />);

		// Open modal
		fireEvent.press(getByTestId("Speaker-button"));
		expect(getByText("Select a Device")).toBeTruthy();

		// Close modal
		fireEvent.press(getByText("Close"));
		await waitFor(() => {
			expect(queryByText("Select a Device")).toBeNull();
		});
	});

	test("displays available devices", async () => {
		const { getByTestId, getByText } = render(<DevicePicker />);

		fireEvent.press(getByTestId("Speaker-button"));

		await waitFor(() => {
			expect(getByText("Phone")).toBeTruthy();
			expect(getByText("Laptop")).toBeTruthy();
		});
	});

	// test("selects a device and makes API call", async () => {
	// 	const { getByTestId, getByText } = render(<DevicePicker />);
	// 	const mockFetch = jest.spyOn(global, "fetch").mockResolvedValue({
	// 		ok: true,
	// 		json: jest.fn().mockResolvedValue({}),
	// 	} as any);

	// 	fireEvent.press(getByTestId("Speaker-button"));
	// 	const phoneRadioButton = getByTestId("radio-button-1");

	// 	fireEvent.press(phoneRadioButton);

	// 	await waitFor(() => {
	// 		expect(mockFetch).toHaveBeenCalledWith(
	// 			"https://api.spotify.com/v1/me/player",
	// 			expect.objectContaining({
	// 				method: "PUT",
	// 				body: JSON.stringify({ device_ids: ["1"] }),
	// 			}),
	// 		);
	// 	});

	// 	mockFetch.mockRestore();
	// });

	test("handles device fetch error", async () => {
		(useSpotifyDevices as jest.Mock).mockReturnValue({
			getDeviceIDs: jest
				.fn()
				.mockRejectedValue(new Error("Failed to fetch devices")),
			devices: [],
			error: "Failed to fetch devices",
		});

		const { getByTestId, getByText } = render(<DevicePicker />);

		fireEvent.press(getByTestId("Speaker-button"));

		await waitFor(() => {
			expect(getByText("Error Fetching Devices")).toBeTruthy();
			expect(getByText("Failed to fetch devices")).toBeTruthy();
		});
	});
});
