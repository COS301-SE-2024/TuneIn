import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { useLive } from "../app/LiveContext";
import DevicePicker from "../app/components/DevicePicker"; // Adjust the path as needed
import { Device } from "@spotify/web-api-ts-sdk";

// Mocking external dependencies
jest.mock("../app/LiveContext", () => ({
	useLive: jest.fn(),
}));

describe("DevicePicker", () => {
	let mockSetIsVisible;
	let roomControlsMock;

	beforeEach(() => {
		mockSetIsVisible = jest.fn();

		roomControlsMock = {
			playbackHandler: {
				spotifyDevices: {
					devices: [
						{ id: "1", name: "Device 1", type: "Smartphone" },
						{ id: "2", name: "Device 2", type: "Computer" },
					],
				},
				activeDevice: { id: "1", name: "Device 1", type: "Smartphone" },
				getDevices: jest.fn().mockResolvedValue(undefined),
				setActiveDevice: jest.fn(),
				deviceError: null,
			},
		};

		(useLive as jest.Mock).mockReturnValue({
			roomControls: roomControlsMock,
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it("renders correctly", () => {
		const { getByTestId, getByText } = render(
			<DevicePicker isVisible={false} setIsVisible={mockSetIsVisible} />,
		);

		// Check that the speaker button is rendered
		expect(getByTestId("Speaker-button")).toBeTruthy();
	});

	it("opens modal when speaker button is pressed", async () => {
		const { getByTestId } = render(
			<DevicePicker isVisible={false} setIsVisible={mockSetIsVisible} />,
		);

		// Press the speaker button to open the modal
		fireEvent.press(getByTestId("Speaker-button"));

		// Expect the modal to be visible
		expect(mockSetIsVisible).toHaveBeenCalledWith(true);
	});

	it("closes modal when overlay is pressed", async () => {
		const { getByTestId } = render(
			<DevicePicker isVisible={true} setIsVisible={mockSetIsVisible} />,
		);

		// Press the overlay to close the modal
		fireEvent.press(getByTestId("modalBackground"));

		// Expect the setIsVisible to be called with false
		expect(mockSetIsVisible).toHaveBeenCalledWith(false);
	});

	it("displays loading indicator when fetching devices", async () => {
		roomControlsMock.playbackHandler.getDevices = jest
			.fn()
			.mockImplementation(() => {
				return new Promise((resolve) => {
					setTimeout(() => {
						resolve();
					}, 500);
				});
			});

		const { getByTestId } = render(
			<DevicePicker isVisible={true} setIsVisible={mockSetIsVisible} />,
		);

		// Simulate opening the modal
		fireEvent.press(getByTestId("Speaker-button"));

		await waitFor(() => {
			expect(roomControlsMock.playbackHandler.getDevices).toHaveBeenCalled();
		});
	});

	it("displays devices and allows selection", async () => {
		const { getByText } = render(
			<DevicePicker isVisible={true} setIsVisible={mockSetIsVisible} />,
		);

		// Expect the devices to be displayed
		expect(getByText("Device 1")).toBeTruthy();
		expect(getByText("Device 2")).toBeTruthy();

		// Select a device
		fireEvent.press(getByText("Device 1"));

		// Expect setActiveDevice to be called with the correct device
		expect(
			roomControlsMock.playbackHandler.setActiveDevice,
		).toHaveBeenCalledWith({
			deviceID: "1",
			userSelected: true,
		});
	});

	it("displays error message when there are no devices", () => {
		roomControlsMock.playbackHandler.spotifyDevices.devices = [];
		const { getByText } = render(
			<DevicePicker isVisible={true} setIsVisible={mockSetIsVisible} />,
		);

		// Expect error message when there are no devices
		expect(getByText("No Devices Available")).toBeTruthy();
	});

	it("displays error message when there is a device error", () => {
		roomControlsMock.playbackHandler.deviceError = "Some error occurred";
		const { getByText } = render(
			<DevicePicker isVisible={true} setIsVisible={mockSetIsVisible} />,
		);

		// Expect error message when there's a device error
		expect(getByText("Error Fetching Devices")).toBeTruthy();
		expect(getByText("Some error occurred")).toBeTruthy();
	});
});
