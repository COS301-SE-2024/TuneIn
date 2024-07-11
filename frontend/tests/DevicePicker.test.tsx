import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import DevicePicker from "../app/components/DevicePicker";
import { useSpotifyAuth } from "../app/hooks/useSpotifyAuth";
import { useSpotifyDevices } from "../app/hooks/useSpotifyDevices";

// Mocking the custom hooks
jest.mock("../app/hooks/useSpotifyAuth");
jest.mock("../app/hooks/useSpotifyDevices");

const mockGetToken = jest.fn();
const mockGetDeviceIDs = jest.fn();

(useSpotifyAuth as jest.Mock).mockReturnValue({
	getToken: mockGetToken,
});

(useSpotifyDevices as jest.Mock).mockReturnValue({
	getDeviceIDs: mockGetDeviceIDs,
});

describe("DevicePicker", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly", () => {
		const { getByText } = render(<DevicePicker />);
		expect(getByText("Previous Screen Content")).toBeTruthy();
		expect(getByText("Open Pop-up")).toBeTruthy();
	});

	it("opens the modal when button is pressed", () => {
		const { getByText, queryByText } = render(<DevicePicker />);
		fireEvent.press(getByText("Open Pop-up"));

		// Check if either "Select a Device" or "No Devices Available" is present
		const selectDeviceText = queryByText("Select a Device");
		const noDevicesText = queryByText("No Devices Available");

		expect(selectDeviceText || noDevicesText).toBeTruthy();
	});

	// it("fetches devices and displays them", async () => {
	// 	// Mock token and device IDs
	// 	mockGetToken.mockResolvedValue("mockToken");
	// 	mockGetDeviceIDs.mockResolvedValue([
	// 		{
	// 			id: "deviceID-1",
	// 			name: "Device 1",
	// 			is_active: true,
	// 			is_private_session: false,
	// 			is_restricted: false,
	// 			supports_volume: true,
	// 			type: "Computer",
	// 			volume_percent: 89,
	// 		},
	// 		{
	// 			id: "deviceID-2",
	// 			name: "Device 2",
	// 			is_active: false,
	// 			is_private_session: false,
	// 			is_restricted: false,
	// 			supports_volume: true,
	// 			type: "SmartPhone",
	// 			volume_percent: 65,
	// 		},
	// 	]);

	// 	// Render the component
	// 	const { getByText, queryByTestId, debug } = render(<DevicePicker />);

	// 	// Trigger opening the modal inside act()
	// 	await act(async () => {
	// 		fireEvent.press(getByText("Open Pop-up"));
	// 	});

	// 	// Wait for token and device ID fetching to complete inside act()
	// 	await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
	// 	await waitFor(() => expect(mockGetDeviceIDs).toHaveBeenCalled());

	// 	// Asserting UI changes should also be inside act()
	// 	act(() => {
	// 		debug();

	// 		expect(getByText("Device 1")).toBeTruthy();
	// 		expect(getByText("Device 2")).toBeTruthy();

	// 		const radioDevice1 = queryByTestId("radio-button-deviceID-1");
	// 		const radioDevice2 = queryByTestId("radio-button-deviceID-2");

	// 		expect(radioDevice1.props.accessibilityState.checked).toBe(true);
	// 		expect(radioDevice2.props.accessibilityState.checked).toBe(false);
	// 	});
	// });

	// it("displays an error if device selection fails", async () => {
	// 	global.fetch = jest.fn(() =>
	// 		Promise.resolve(createMockResponse({ ok: false })),
	// 	);

	// 	mockGetToken.mockResolvedValue("mockToken");
	// 	mockGetDeviceIDs.mockResolvedValue([
	// 		{ id: "device1", name: "Device 1", is_active: true },
	// 	]);

	// 	const { getByText, queryByText } = render(<DevicePicker />);

	// 	await act(async () => {
	// 		fireEvent.press(getByText("Open Pop-up"));
	// 	});

	// 	await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
	// 	await waitFor(() => expect(mockGetDeviceIDs).toHaveBeenCalled());

	// 	await act(async () => {
	// 		fireEvent.press(getByText("Device 1"));
	// 	});

	// 	await waitFor(() => expect(queryByText("Error")).toBeTruthy());
	// 	await waitFor(() =>
	// 		expect(
	// 			queryByText("Failed to transfer playback to the selected device."),
	// 		).toBeTruthy(),
	// 	);

	// 	// Clear mock for fetch after the test
	// 	(global.fetch as jest.Mock).mockClear();
	// });
});
