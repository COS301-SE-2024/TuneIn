import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Search from "../app/screens/Search"; // Adjust the path as needed
import { useNavigation } from "expo-router";
import renderer from "react-test-renderer";

// Mocking modules
jest.mock("expo-router", () => ({
	useNavigation: jest.fn(),
}));

jest.mock("../app/components/rooms/RoomCardWidget", () => (props: any) => (
	<div {...props} />
));
jest.mock("../app/components/UserItem", () => (props: any) => (
	<div {...props} />
));
jest.mock("../app/components/NavBar", () => () => <div />);

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

	it("should display the modal with filter options when filter button is pressed", () => {
		const { getByTestId, getByText } = render(<Search />);
		const filterButton = getByTestId("filter-button");
		fireEvent.press(filterButton);
		expect(getByText("Select Filters")).toBeTruthy();
	});

	it("should handle filter selection and display selected filters", async () => {
		const { getByTestId, getByText, queryByText } = render(<Search />);

		// Open the filter modal
		const filterButton = getByTestId("filter-button");
		fireEvent.press(filterButton);

		// Select a filter
		const filterOption = getByText("Room Name");
		fireEvent.press(filterOption);

		// Close the modal
		const closeButton = getByTestId("close-button");
		fireEvent.press(closeButton);

		// Check if the selected filter is displayed
		expect(getByText("Room Name")).toBeTruthy();
	});
});
