import React from "react";
import { render, waitFor, fireEvent } from "@testing-library/react-native";
import axios from "axios";
import TopNavBar from "../../app/components/TopNavBar"; // Adjust the path as needed
import auth from "../../app/services/AuthManagement";
import { useRouter } from "expo-router";

// Mock the necessary modules
jest.mock("axios");
jest.mock("../../app/services/AuthManagement");
jest.mock("expo-router", () => ({
	useRouter: jest.fn(),
}));

const defaultProfileIcon = require("../../assets/profile-icon.png");

describe("TopNavBar", () => {
	let routerMock: any;

	beforeEach(() => {
		routerMock = { push: jest.fn() };
		(useRouter as jest.Mock).mockReturnValue(routerMock);
	});

	it("displays default profile icon when no profile image is provided", async () => {
		(auth.getToken as jest.Mock).mockResolvedValue("fake-token");
		(axios.get as jest.Mock).mockResolvedValue({
			data: { profile_picture_url: null }, // Simulate no profile image
		});

		const { getByTestId } = render(<TopNavBar />);

		await waitFor(() => {
			// Ensure the default image is displayed
			expect(getByTestId("profile-image").props.source).toEqual(
				defaultProfileIcon,
			);
		});
	});

	it("navigates to DMs page when DMs icon is pressed", () => {
		const { getByTestId } = render(<TopNavBar />);
		fireEvent.press(getByTestId("dm-icon"));
		expect(routerMock.push).toHaveBeenCalledWith({
			pathname: "/screens/messaging/ChatListScreen",
		});
	});

	it("displays default profile icon on error while fetching profile image", async () => {
		(auth.getToken as jest.Mock).mockResolvedValue("fake-token");
		(axios.get as jest.Mock).mockRejectedValue(
			new Error("Error fetching profile image"),
		);

		const { getByTestId } = render(<TopNavBar />);

		await waitFor(() => {
			expect(getByTestId("profile-image").props.source).toEqual(
				defaultProfileIcon,
			);
		});
	});
});
