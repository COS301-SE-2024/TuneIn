import axios from "axios";
import auth from "../../app/services/AuthManagement";
import * as utils from "../../app/services/Utils";
import FriendServices from "../../app/services/FriendServices";

jest.mock("axios");
jest.mock("../../app/services/AuthManagement");

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

	// Additional tests can be added for other methods similarly
});
