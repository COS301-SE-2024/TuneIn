// DevicePicker.test.tsx
import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
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

(useSpotifyDevices as jest.Mock).mockReturnValue({
	getDeviceIDs: mockGetDeviceIDs,
	devices: [],
	error: null,
});

describe("DevicePicker", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly", () => {
		const { getByTestId } = render(<DevicePicker />);
		expect(getByTestId("Speaker-button")).toBeTruthy();
	});

	it("opens the modal when button is pressed", () => {
		const { queryByText, getByTestId } = render(<DevicePicker />);
		fireEvent.press(getByTestId("Speaker-button"));

		const selectDeviceText = queryByText("Select a Device");
		const noDevicesText = queryByText("No Devices Available");

		expect(selectDeviceText || noDevicesText).toBeTruthy();
	});

	it("fetches devices and displays them", async () => {
		// Mock token and device IDs
		mockGetToken.mockResolvedValue("mockToken");
		mockGetDeviceIDs.mockResolvedValue([
			{
				id: "deviceID-1",
				name: "Device 1",
				is_active: true,
				is_private_session: false,
				is_restricted: false,
				supports_volume: true,
				type: "Computer",
				volume_percent: 89,
			},
			{
				id: "deviceID-2",
				name: "Device 2",
				is_active: false,
				is_private_session: false,
				is_restricted: false,
				supports_volume: true,
				type: "SmartPhone",
				volume_percent: 65,
			},
		]);

		// Render the component
		const { getByText, queryByTestId, getByTestId } = render(<DevicePicker />);

		// Trigger opening the modal inside act()
		await act(async () => {
			fireEvent.press(getByTestId("Speaker-button"));
		});

		// Wait for token and device ID fetching to complete inside act()
		await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
		await waitFor(() => expect(mockGetDeviceIDs).toHaveBeenCalled());

		// Asserting UI changes should also be inside act()
		await act(async () => {
			expect(getByText("Device 1")).toBeTruthy();
			expect(getByText("Device 2")).toBeTruthy();

			const radioDevice1 = queryByTestId("radio-button-deviceID-1");
			const radioDevice2 = queryByTestId("radio-button-deviceID-2");
			if (radioDevice1 && radioDevice2) {
				expect(radioDevice1.props.accessibilityState.checked).toBe(true);
				expect(radioDevice2.props.accessibilityState.checked).toBe(false);
			}
		});
	});
});
