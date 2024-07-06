// import React from "react";
// import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
// import DevicePicker from "../app/components/DevicePicker";
// import { useSpotifyAuth } from "../app/hooks/useSpotifyAuth";
// import { useSpotifyDevices } from "../app/hooks/useSpotifyDevices";

// jest.mock("../hooks/useSpotifyAuth");
// jest.mock("../hooks/useSpotifyDevices");

// const mockGetToken = jest.fn();
// const mockGetDeviceIDs = jest.fn();

// useSpotifyAuth.mockReturnValue({
// 	getToken: mockGetToken,
// });

// useSpotifyDevices.mockReturnValue({
// 	getDeviceIDs: mockGetDeviceIDs,
// });

// describe("DevicePicker", () => {
// 	beforeEach(() => {
// 		jest.clearAllMocks();
// 	});

// 	it("renders correctly", () => {
// 		const { getByText } = render(<DevicePicker />);
// 		expect(getByText("Previous Screen Content")).toBeTruthy();
// 		expect(getByText("Open Pop-up")).toBeTruthy();
// 	});

// 	it("opens the modal when button is pressed", () => {
// 		const { getByText } = render(<DevicePicker />);
// 		fireEvent.press(getByText("Open Pop-up"));
// 		expect(getByText("Select a Device")).toBeTruthy();
// 	});

// 	it("fetches devices and displays them", async () => {
// 		mockGetToken.mockResolvedValue("mockToken");
// 		mockGetDeviceIDs.mockResolvedValue([
// 			{ id: "device1", name: "Device 1", is_active: true },
// 			{ id: "device2", name: "Device 2", is_active: false },
// 		]);

// 		const { getByText, getByTestId } = render(<DevicePicker />);

// 		await act(async () => {
// 			fireEvent.press(getByText("Open Pop-up"));
// 		});

// 		await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
// 		await waitFor(() => expect(mockGetDeviceIDs).toHaveBeenCalled());

// 		expect(getByText("Device 1")).toBeTruthy();
// 		expect(getByText("Device 2")).toBeTruthy();
// 		expect(getByTestId("radio-button-device1").props.status).toBe("checked");
// 	});

// 	it("displays an error if device selection fails", async () => {
// 		global.fetch = jest.fn(() =>
// 			Promise.resolve({
// 				ok: false,
// 			}),
// 		);

// 		mockGetToken.mockResolvedValue("mockToken");
// 		mockGetDeviceIDs.mockResolvedValue([
// 			{ id: "device1", name: "Device 1", is_active: true },
// 		]);

// 		const { getByText, queryByText } = render(<DevicePicker />);

// 		await act(async () => {
// 			fireEvent.press(getByText("Open Pop-up"));
// 		});

// 		await waitFor(() => expect(mockGetToken).toHaveBeenCalled());
// 		await waitFor(() => expect(mockGetDeviceIDs).toHaveBeenCalled());

// 		await act(async () => {
// 			fireEvent.press(getByText("Device 1"));
// 		});

// 		await waitFor(() => expect(queryByText("Error")).toBeTruthy());
// 		await waitFor(() =>
// 			expect(
// 				queryByText("Failed to transfer playback to the selected device."),
// 			).toBeTruthy(),
// 		);

// 		global.fetch.mockClear();
// 	});
// });
