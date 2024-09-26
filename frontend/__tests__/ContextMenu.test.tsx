import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ContextMenu from "../app/components/ContextMenu"; // Adjust the import based on your file structure

describe("ContextMenu", () => {
	const mockOnClose = jest.fn();
	const mockOnAdvancedSettings = jest.fn();
	const mockOnRoomInfo = jest.fn();
	const mockOnShareRoom = jest.fn();
	const mockOnSavePlaylist = jest.fn();

	const setup = (isVisible: boolean, isHost: boolean) => {
		return render(
			<ContextMenu
				isVisible={isVisible}
				onClose={mockOnClose}
				onAdvancedSettings={mockOnAdvancedSettings}
				onRoomInfo={mockOnRoomInfo}
				onShareRoom={mockOnShareRoom}
				onSavePlaylist={mockOnSavePlaylist}
				isHost={isHost}
			/>,
		);
	};

	it("renders correctly when visible and is host", () => {
		const { getByText } = setup(true, true);

		expect(getByText("Advanced Settings")).toBeTruthy();
		expect(getByText("Share")).toBeTruthy();
		expect(getByText("Save Playlist")).toBeTruthy();
	});

	it("renders correctly when visible and is not host", () => {
		const { getByText } = setup(true, false); // Setup the menu as visible and not a host

		expect(getByText("Room Info")).toBeTruthy();
		expect(getByText(/Share/i)).toBeTruthy(); // Updated to use regex for "Share"
		expect(getByText(/Save Playlist/i)).toBeTruthy(); // Updated to use regex for "Save Playlist"
	});

	it("calls onClose when overlay is pressed", () => {
		const { getByTestId } = setup(true, true);

		fireEvent.press(getByTestId("overlay"));
		expect(mockOnClose).toHaveBeenCalled();
	});

	it("calls onAdvancedSettings when Advanced Settings is pressed", () => {
		const { getByText } = setup(true, true);

		fireEvent.press(getByText("Advanced Settings"));
		expect(mockOnAdvancedSettings).toHaveBeenCalled();
	});

	it("calls onRoomInfo when Room Info is pressed", () => {
		const { getByText } = setup(true, false);

		fireEvent.press(getByText("Room Info"));
		expect(mockOnRoomInfo).toHaveBeenCalled();
	});

	it("calls onShareRoom when Share is pressed", () => {
		const { getByText } = setup(true, true);

		// Use regex to match "Share" even if it's wrapped in another <Text>
		fireEvent.press(getByText(/Share/i));
		expect(mockOnShareRoom).toHaveBeenCalled();
	});

	it("calls onSavePlaylist when Save Playlist is pressed", () => {
		const { getByText } = setup(true, true);

		// Use regex to match "Save Playlist" even if it's wrapped in another <Text>
		fireEvent.press(getByText(/Save Playlist/i));
		expect(mockOnSavePlaylist).toHaveBeenCalled();
	});
});
