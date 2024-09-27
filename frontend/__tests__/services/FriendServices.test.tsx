import axios from "axios";
import auth from "../../app/services/AuthManagement";
import * as utils from "../../app/services/Utils";
import FriendServices from "../../app/services/FriendServices";

jest.mock("axios");
jest.mock("../../app/services/AuthManagement");
// Mock the global fetch
global.fetch = jest.fn();

describe("FriendServices", () => {
	const mockToken = "mockToken";

	const mockFriend = {
		profile_picture_url: "image.jpg",
		username: "Test friend",
		friend_id: "mew234",
		relationship: "friend",
	};

	beforeEach(() => {
		(auth.getToken as jest.Mock).mockResolvedValue(mockToken);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test("getFriends should fetch friends and return them", async () => {
		const friendsData = [
			{
				profile_picture_url: "url1",
				userID: "1",
				username: "friend1",
				relationship: "friend",
			},
			{
				profile_picture_url: "url2",
				userID: "2",
				username: "friend2",
				relationship: "friend",
			},
		];

		(axios.get as jest.Mock).mockResolvedValue({ data: friendsData });

		const friends = await FriendServices.getFriends();

		expect(friends).toEqual([
			{
				profile_picture_url: "url1",
				friend_id: "1",
				username: "friend1",
				relationship: "friend",
			},
			{
				profile_picture_url: "url2",
				friend_id: "2",
				username: "friend2",
				relationship: "friend",
			},
		]);
		expect(axios.get).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/friends`,
			{
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	test("getFriendRequests should fetch friend requests and return them", async () => {
		const requestsData = [
			{ profile_picture_url: "url3", userID: "3", username: "request1" },
		];

		(axios.get as jest.Mock).mockResolvedValue({ data: requestsData });

		const requests = await FriendServices.getFriendRequests();

		expect(requests).toEqual([
			{ profile_picture_url: "url3", friend_id: "3", username: "request1" },
		]);
		expect(axios.get).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/friends/requests`,
			{
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	test("getPotentialFriends should fetch potential friends and return them", async () => {
		const potentialFriendsData = [
			{ profile_picture_url: "url4", userID: "4", username: "potential1" },
		];

		(axios.get as jest.Mock).mockResolvedValue({ data: potentialFriendsData });

		const potentialFriends = await FriendServices.getPotentialFriends();

		expect(potentialFriends).toEqual([
			{
				profile_picture_url: "url4",
				friend_id: "4",
				username: "potential1",
				relationship: "mutual",
			},
		]);
		expect(axios.get).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/friends/potential`,
			{
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	test("fetchFollowers should fetch followers and return them", async () => {
		const followersData = [
			{
				profile_picture_url: "url5",
				userID: "5",
				username: "follower1",
				relationship: "follower",
			},
		];

		(axios.get as jest.Mock).mockResolvedValue({ data: followersData });

		const followers = await FriendServices.fetchFollowers();

		expect(followers).toEqual([
			{
				profile_picture_url: "url5",
				friend_id: "5",
				username: "follower1",
				relationship: "follower",
			},
		]);
		expect(axios.get).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/followers`,
			{
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	// Test for error handling in getFriends
	test("getFriends should throw an error on failure", async () => {
		(axios.get as jest.Mock).mockRejectedValue(new Error("Network Error"));

		await expect(FriendServices.getFriends()).rejects.toThrow("Network Error");
	});

	// Test for error handling in getFriendRequests
	test("getFriendRequests should throw an error on failure", async () => {
		(axios.get as jest.Mock).mockRejectedValue(new Error("Network Error"));

		await expect(FriendServices.getFriendRequests()).rejects.toThrow(
			"Network Error",
		);
	});

	// Test for error handling in getPotentialFriends
	test("getPotentialFriends should throw an error on failure", async () => {
		(axios.get as jest.Mock).mockRejectedValue(new Error("Network Error"));

		await expect(FriendServices.getPotentialFriends()).rejects.toThrow(
			"Network Error",
		);
	});

	// Test for error handling in fetchFollowers
	test("fetchFollowers should throw an error on failure", async () => {
		(axios.get as jest.Mock).mockRejectedValue(new Error("Network Error"));

		await expect(FriendServices.fetchFollowers()).rejects.toThrow(
			"Network Error",
		);
	});

	// Test for handleSendRequest
	test("handleSendRequest should send a friend request successfully", async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ status: 201 });

		await FriendServices.handleSendRequest(mockFriend);

		expect(global.fetch).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/Test friend/befriend`,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	test("handleSendRequest should throw an error on failure", async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ status: 400 });

		await expect(FriendServices.handleSendRequest(mockFriend)).rejects.toThrow(
			"Failed to send request.",
		);
	});

	// Test for handleCancelRequest
	test("handleCancelRequest should cancel a friend request successfully", async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ status: 201 });

		await FriendServices.handleCancelRequest(mockFriend);

		expect(global.fetch).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/Test friend/cancel`,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	test("handleCancelRequest should throw an error on failure", async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ status: 400 });

		await expect(
			FriendServices.handleCancelRequest(mockFriend),
		).rejects.toThrow("Failed to cancel request.");
	});

	// Test for handleFriendRequest
	test("handleFriendRequest should accept a friend request successfully", async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ status: 201 });

		await FriendServices.handleFriendRequest(mockFriend, true);

		expect(global.fetch).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/Test friend/accept`,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	test("handleFriendRequest should reject a friend request successfully", async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ status: 201 });

		await FriendServices.handleFriendRequest(mockFriend, false);

		expect(global.fetch).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/Test friend/reject`,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	test("handleFriendRequest should throw an error on failure", async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ status: 400 });

		await expect(
			FriendServices.handleFriendRequest(mockFriend, true),
		).rejects.toThrow("Failed to handle request.");
	});

	// Test for handleFriend
	test("handleFriend should unfriend a user successfully", async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ status: 201 });

		await FriendServices.handleFriend(mockFriend);

		expect(global.fetch).toHaveBeenCalledWith(
			`${utils.API_BASE_URL}/users/Test friend/unfriend`,
			{
				method: "POST",
				headers: { Authorization: `Bearer ${mockToken}` },
			},
		);
	});

	test("handleFriend should throw an error on failure", async () => {
		(global.fetch as jest.Mock).mockResolvedValue({ status: 400 });

		await expect(FriendServices.handleFriend(mockFriend)).rejects.toThrow(
			"Failed to unfriend.",
		);
	});
});
