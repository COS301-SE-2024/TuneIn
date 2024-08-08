import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Search from "../app/screens/Search"; // Adjust the path as needed
import { useNavigation } from "expo-router";
import renderer from "react-test-renderer";

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

describe("Search Component", () => {
	beforeEach(() => {
		// Clear mocks before each test
		(useNavigation as jest.Mock).mockClear();
	});

	it("should render correctly", () => {
		const tree = renderer.create(<Search />).toJSON();
		expect(tree).toMatchSnapshot();
	});

	it("should render the header with a title and back button", () => {
		const { getByText, getByTestId } = render(<Search />);
		expect(getByText("Search")).toBeTruthy();
		expect(getByTestId("back-button")).toBeTruthy();
	});

	it("should handle search input changes", () => {
		const { getByPlaceholderText } = render(<Search />);
		const searchInput = getByPlaceholderText("Search...");
		fireEvent.changeText(searchInput, "Room 1");
		expect(searchInput.props.value).toBe("Room 1");
	});

	// it("should perform search and display results", async () => {
	// 	const { getByPlaceholderText, getByTestId, getByText } = render(<Search />);
	// 	const searchInput = getByPlaceholderText("Search...");

	// 	fireEvent.changeText(searchInput, "Room 1");
	// 	expect(searchInput.props.value).toBe("Room 1");
	// 	fireEvent.press(getByTestId("search-button"));
	// 	getByText("Room 1");

	// 	// Mocking the actual search logic inside the Search component if necessary
	// 	// await waitFor(() => {
	// 	// 	expect(getByText("Room 1")).toBeTruthy();
	// 	// });
	// });

	// test("should filter results by room", () => {
	// 	const { getByTestId, getByText } = render(<Search />);

	// 	// Simulate user interaction to filter results
	// 	fireEvent.changeText(getByTestId("search-input"), "Room 1");
	// 	fireEvent.press(getByTestId("search-button"));

	// 	// Debug the output to see if the expected text is rendered
	// 	screen.debug();

	// 	// Assert that room results are displayed
	// 	expect(getByText("Room 1")).toBeTruthy();
	// 	expect(getByText("Room 2")).toBeTruthy();

	// 	// Assert that user results are not displayed
	// 	expect(() => getByText("User 1")).toThrow();
	// 	expect(() => getByText("User 2")).toThrow();
	// });

	// test("should filter results by user", () => {
	// 	render(<Search />);

	// 	// Simulate user interaction
	// 	fireEvent.changeText(screen.getByPlaceholderText("Search..."), "User 1");
	// 	fireEvent.press(screen.getByTestId("search-button"));

	// 	// Debug to check what is rendered
	// 	screen.debug();

	// 	// Assert that user results are displayed
	// 	expect(screen.getByText("User 1")).toBeTruthy();
	// 	expect(screen.getByText("User 2")).toBeTruthy();

	// 	// Assert that room results are not displayed
	// 	expect(() => screen.getByText("Room 1")).toThrow();
	// 	expect(() => screen.getByText("Room 2")).toThrow();
	// });

	it("should toggle more filters", async () => {
		const { getByText, getByTestId, queryByTestId } = render(<Search />);

		// Press the button to show more filters
		fireEvent.press(getByText("View More Filters"));
		expect(getByTestId("host-toggle")).toBeTruthy();
		expect(getByTestId("room-count-toggle")).toBeTruthy();

		// Press the button to hide more filters
		fireEvent.press(getByText("View Less Filters"));
		expect(queryByTestId("host-toggle")).toBeNull();
		expect(queryByTestId("room-count-toggle")).toBeNull();
	});

	it("should handle explicit filter switch", () => {
		const { getByTestId, getByText } = render(<Search />);
		fireEvent.press(getByText("View More Filters"));
		const explicitSwitch = getByTestId("explicit-switch");

		// Simulate toggling the switch
		fireEvent(explicitSwitch, "valueChange", true);

		// Verify the switch value has changed
		expect(explicitSwitch.props.value).toBe(true);
	});

	it("should handle nsfw filter switch", () => {
		const { getByTestId, getByText } = render(<Search />);
		fireEvent.press(getByText("View More Filters"));
		const nsfwSwitch = getByTestId("nsfw-switch");

		// Simulate toggling the switch
		fireEvent(nsfwSwitch, "valueChange", true);

		// Verify the switch value has changed
		expect(nsfwSwitch.props.value).toBe(true);
	});
});
