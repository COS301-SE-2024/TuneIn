import React, { useState } from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import UserItem from "../app/components/UserItem";
import { User } from "../app/models/user";
import { Player } from "../app/PlayerContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../app/services/AuthManagement";
import * as StorageService from "../app/services/StorageService";
import axios from "axios";

const userMock: User = {
	id: "id",
	profile_picture_url: "picture",
	profile_name: "name",
	username: "username",
	followers: [{ username: "follower" }, { username: "follower2" }],
};

jest.mock("@react-native-async-storage/async-storage", () => ({
	getItem: jest.fn(),
}));

jest.mock("../app/services/AuthManagement", () => ({
	__esModule: true,
	default: {
		getToken: jest.fn(), // Mock getToken method
	},
}));

jest.mock("../app/services/StorageService", () => ({
	__esModule: true,
	getItem: jest.fn(),
}));

jest.mock("axios");

const PlayerContextProviderMock = ({ children, value }) => {
	const [userData, setUserData] = useState(value.userData);

	const mockValue = {
		...value,
		userData,
		setUserData,
	};

	return <Player.Provider value={mockValue}>{children}</Player.Provider>;
};

describe("UserItem component", () => {
	beforeEach(() => {
		// Clear mocks and set initial states
		jest.clearAllMocks();
		(AsyncStorage.getItem as jest.Mock).mockClear();
		(axios.get as jest.Mock).mockClear();
		(auth.getToken as jest.Mock).mockReturnValue("token");
		(StorageService.getItem as jest.Mock).mockResolvedValue([]);
	});

	it("renders correctly when user follows user", () => {
		const mockPlayerContextValue = {
			userData: {
				username: "follower",
			},
		};

		const { getByText, queryByTestId } = render(
			<PlayerContextProviderMock value={mockPlayerContextValue}>
				<UserItem user={userMock} />
			</PlayerContextProviderMock>,
		);

		// Assert room name
		expect(getByText("name")).toBeTruthy();

		// Assert song name and artist name using more specific queries
		expect(getByText("username")).toBeTruthy();

		// Assert background image source
		const imageBackground = queryByTestId("profile-pic");
	});
});
