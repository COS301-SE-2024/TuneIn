import mockAxios from "jest-mock-axios";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ChatListScreen from "../../app/screens/messaging/ChatListScreen"; // Adjust the import paths accordingly
import { NavigationContainer } from "@react-navigation/native";
import { useLive } from "../../app/LiveContext"; // Adjust import based on your file structure

jest.mock("../../app/LiveContext", () => ({
	useLive: jest.fn(),
}));

describe("ChatListScreen", () => {
	beforeEach(() => {
		(useLive as jest.Mock).mockReturnValue({
			currentUser: { userID: "user1", username: "Alice" }, // Mocking Alice as the current user
			recentDMs: [
				{
					message: {
						pID: "1",
						sender: { userID: "user1", profile_name: "Alice" },
						recipient: { userID: "user2", profile_name: "Bob" },
					},
				},
				{
					message: {
						pID: "2",
						sender: { userID: "user2", profile_name: "Bob" },
						recipient: { userID: "user1", profile_name: "Alice" },
					},
				},
			], // Mocking recent direct messages
			refreshUser: jest.fn(),
			setRefreshUser: jest.fn(),
			setFetchRecentDMs: jest.fn(),
		});
	});

	afterEach(() => {
		mockAxios.reset(); // This ensures Axios is reset after each test
	});

	const renderWithNavigation = (component: JSX.Element) => {
		return render(<NavigationContainer>{component}</NavigationContainer>);
	};

	it("renders correctly", () => {
		const { getByText } = renderWithNavigation(<ChatListScreen />);
		expect(getByText("Chats")).toBeTruthy(); // Check if the Chats header is rendered
	});

	it("displays no results message when no chats match the search", async () => {
		const { getByPlaceholderText, getByText } = renderWithNavigation(
			<ChatListScreen />,
		);
		fireEvent.changeText(
			getByPlaceholderText("Search for a user..."),
			"Charlie",
		);
		await waitFor(() => {
			expect(getByText("No results found.")).toBeTruthy();
		});
	});

	it("opens the create chat modal", () => {
		const { getByTestId } = renderWithNavigation(<ChatListScreen />);
		fireEvent.press(getByTestId("new-chat-button")); // Press the new chat button
	});

	it("closes the create chat modal when backdrop is pressed", async () => {
		const { getByTestId } = renderWithNavigation(<ChatListScreen />);
		fireEvent.press(getByTestId("new-chat-button")); // Open the modal
		await waitFor(() => {
			fireEvent.press(getByTestId("close-button")); // Simulate closing the modal
		});
	});
});
