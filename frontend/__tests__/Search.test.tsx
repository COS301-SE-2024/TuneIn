import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import Search from "../app/screens/Search"; // Adjust the path as needed
import { useNavigation } from "expo-router";
import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import auth from "../app/services/AuthManagement";
// import Fuse from "fuse.js";

// Mocking modules
jest.mock("expo-router", () => ({
	useNavigation: jest.fn(),
}));

jest.mock("../app/components/rooms/RoomCardWidget", () => {
	const MockRoomCardWidget = (props: Record<string, unknown>) => (
		<div {...props} />
	);
	MockRoomCardWidget.displayName = "MockRoomCardWidget";
	return MockRoomCardWidget;
});

jest.mock("../app/components/UserItem", () => {
	const MockUserItem = (props: Record<string, unknown>) => <div {...props} />;
	MockUserItem.displayName = "MockUserItem";
	return MockUserItem;
});

jest.mock("../app/components/NavBar", () => {
	const MockNavBar = () => <div />;
	MockNavBar.displayName = "MockNavBar";
	return MockNavBar;
});

jest.mock("axios");

// jest.mock('fuse.js', () => {
// 	return jest.fn().mockImplementation(() => {
// 		return {
// 			search: jest.fn(),
// 		};
// 	});
// });

jest.mock("../app/services/AuthManagement", () => ({
	__esModule: true,
	default: {
		getToken: jest.fn(), // Mock getToken method
	},
}));

const roomMock = [
	{
		creator: {
			profile_name: "Farmer23",
			userID: "01ece2d8-e091-7023-c1f2-d3399faa7071",
			username: "farmer 345",
			profile_picture_url:
				"https://tunein-nest-bucket.s3.af-south-1.amazonaws.com/2024-06-23T13:23:20.848Z-image.jpeg",
			followers: { count: 0, data: [] },
			following: { count: 0, data: [] },
			links: { count: 0, data: [] },
			bio: "Music enthusiast who loves exploring new tunes across various genres. Always on the lookout for fresh beats and hidden gems!",
			current_song: {
				title: "",
				artists: [],
				cover: "",
				start_time: "2024-08-11T17:22:28.862Z",
			},
			fav_genres: { count: 0, data: [] },
			fav_songs: { count: 0, data: [] },
			fav_rooms: { count: 0, data: [] },
			recent_rooms: { count: 0, data: [] },
		},
		roomID: "66bb6bf7-25be-45af-bc38-7e7e258797b8",
		participant_count: 0,
		room_name: "chill vibes",
		description:
			"A room for relaxing and enjoying soothing music. Join us to unwind and chill with your favorite tunes.",
		is_temporary: false,
		is_private: false,
		is_scheduled: false,
		start_date: "2024-08-11T17:22:28.862Z",
		end_date: "2024-08-11T17:22:28.862Z",
		language: "English",
		has_explicit_content: true,
		has_nsfw_content: false,
		room_image: "https://ik.imagekit.io/ikmedia/backlit.jpg",
		current_song: {
			title: "",
			artists: [],
			cover: "",
			start_time: "2024-08-11T17:22:28.862Z",
		},
		tags: ["explicit"],
	},
];

const userMock = [
	{
		id: "2",
		type: "user",
		name: "User 1",
		userData: {
			id: "1",
			profile_picture_url:
				"https://wallpapers-clan.com/wp-content/uploads/2023/11/marvel-iron-man-in-destroyed-suit-desktop-wallpaper-preview.jpg",
			profile_name: "User 1",
			username: "user1",
		},
	},
	{
		id: "4",
		type: "user",
		name: "User 2",
		userData: {
			id: "2",
			profile_picture_url:
				"https://wallpapers-clan.com/wp-content/uploads/2023/11/marvel-iron-man-in-destroyed-suit-desktop-wallpaper-preview.jpg",
			profile_name: "User 2",
			username: "user2",
		},
	},
];

const uHistDtoMock = [
	{
		search_term: "nothing",
		search_time: "2024-07-19T09:03:19.651Z",
		url: "/search/users?q=nothing",
	},
];

describe("Search Component", () => {
	beforeEach(() => {
		// Clear mocks before each test
		(useNavigation as jest.Mock).mockClear();
		(axios.get as jest.Mock).mockClear();
		(auth.getToken as jest.Mock).mockReturnValue("token");
	});

	it("should render the header with a title and back button", () => {
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValueOnce({ data: uHistDtoMock });
		const { getByText, getByTestId } = render(<Search />);
		expect(getByText("Search")).toBeTruthy();
		expect(getByTestId("back-button")).toBeTruthy();
	});

	it("should handle search input changes", () => {
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValue({ data: uHistDtoMock });

		const { getByPlaceholderText } = render(<Search />);
		const searchInput = getByPlaceholderText("Search...");
		fireEvent.changeText(searchInput, "Room 1");
		expect(searchInput.props.value).toBe("Room 1");
	});

	it("should toggle more filters", async () => {
		// Mock search result
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValue({ data: uHistDtoMock });

		// Render the page component (this triggers the mock usage)
		const { getByText, getByTestId, queryByTestId } = render(<Search />);

		// Press the button to show more filters
		fireEvent.press(getByText("View More Filters"));

		// Check if the additional filters are shown
		await waitFor(() => {
			expect(getByTestId("host-toggle")).toBeTruthy();
			expect(getByTestId("room-count-toggle")).toBeTruthy();
		});

		// Press the button to hide more filters
		fireEvent.press(getByText("View Less Filters"));

		await waitFor(() => {
			// Check if the additional filters are hidden
			expect(queryByTestId("host-toggle")).toBeNull();
			expect(queryByTestId("room-count-toggle")).toBeNull();
		});
	});

	it("should handle explicit filter switch", async () => {
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValue({ data: uHistDtoMock });
		const { getByTestId, getByText } = render(<Search />);
		fireEvent.press(getByText("View More Filters"));
		const explicitSwitch = getByTestId("explicit-switch");

		// Simulate toggling the switch
		fireEvent(explicitSwitch, "valueChange", true);

		// Verify the switch value has changed
		await waitFor(() => {
			expect(explicitSwitch.props.value).toBe(true);
		});
	});

	it("should handle nsfw filter switch", async () => {
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValue({ data: uHistDtoMock });
		const { getByTestId, getByText } = render(<Search />);
		fireEvent.press(getByText("View More Filters"));
		const nsfwSwitch = getByTestId("nsfw-switch");

		// Simulate toggling the switch
		fireEvent(nsfwSwitch, "valueChange", true);

		// Verify the switch value has changed
		await waitFor(() => {
			expect(nsfwSwitch.props.value).toBe(true);
		});
	});

	it("should handle temp filter switch", async () => {
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValue({ data: uHistDtoMock });
		const { getByTestId, getByText } = render(<Search />);
		fireEvent.press(getByText("View More Filters"));
		const tempSwitch = getByTestId("temp-switch");

		// Simulate toggling the switch
		fireEvent(tempSwitch, "valueChange", true);

		// Verify the switch value has changed
		await waitFor(() => {
			expect(tempSwitch.props.value).toBe(true);
		});
	});

	it("should handle priv filter switch", () => {
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValue({ data: uHistDtoMock });
		const { getByTestId, getByText } = render(<Search />);
		fireEvent.press(getByText("View More Filters"));
		const privSwitch = getByTestId("priv-switch");

		// Simulate toggling the switch
		fireEvent(privSwitch, "valueChange", true);

		// Verify the switch value has changed
		expect(privSwitch.props.value).toBe(true);
	});

	it("should handle scheduled filter switch", async () => {
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValue({ data: uHistDtoMock });
		const { getByTestId, getByText } = render(<Search />);
		fireEvent.press(getByText("View More Filters"));
		const scheduledSwitch = getByTestId("scheduled-switch");

		// Simulate toggling the switch
		fireEvent(scheduledSwitch, "valueChange", true);

		// Verify the switch value has changed
		await waitFor(() => {
			expect(scheduledSwitch.props.value).toBe(true);
		});
	});

	it("should search with all room filters", async () => {
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValue({ data: uHistDtoMock });
		const { getByPlaceholderText, getByTestId } = render(<Search />);
		fireEvent.press(getByTestId("toggle-filters-button"));

		// Simulate filter switches
		fireEvent(getByTestId("explicit-switch"), "valueChange", true);
		fireEvent(getByTestId("nsfw-switch"), "valueChange", true);
		fireEvent(getByTestId("temp-switch"), "valueChange", true);
		fireEvent(getByTestId("priv-switch"), "valueChange", true);
		fireEvent(getByTestId("scheduled-switch"), "valueChange", true);

		await waitFor(async () => {
			const searchInput = getByPlaceholderText("Search...");
			fireEvent.changeText(searchInput, "Room 1");
			fireEvent.press(getByTestId("search-button"));
		});
	});

	it("should search with no room filters", async () => {
		(axios.get as jest.Mock)
			.mockResolvedValueOnce({ data: roomMock })
			.mockResolvedValueOnce({ data: uHistDtoMock })
			.mockResolvedValueOnce({ data: ["jazz", "rock"] })
			.mockResolvedValueOnce({ data: [] })
			.mockResolvedValue({ data: uHistDtoMock });

		(axios.get as jest.Mock).mockResolvedValueOnce({ data: roomMock });
		const { getByPlaceholderText, getByTestId, getByText } = render(<Search />);
		fireEvent.press(getByTestId("toggle-filters-button"));

		await waitFor(
			async () => {
				const searchInput = getByPlaceholderText("Search...");
				fireEvent.changeText(searchInput, "nothing");
				fireEvent.press(getByTestId("search-button"));
			},
			{ timeout: 20000 },
		);

		// await waitFor(async () => {
		// 	expect(getByTestId("search-button")).toBe("nothing");
		// });
	}, 30000);
});
