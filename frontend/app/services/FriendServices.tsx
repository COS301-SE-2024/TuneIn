import axios from "axios";
import auth from "./AuthManagement";
import * as utils from "./Utils";
import { Friend } from "../models/friend";

class FriendServices {
	// Fetch all friends
	static async getFriends(): Promise<Friend[]> {
		const token = await auth.getToken();
		try {
			const response = await axios.get(`${utils.API_BASE_URL}/users/friends`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			return response.data.map((friend: any) => ({
				profile_picture_url: friend.profile_picture_url,
				friend_id: friend.userID,
				username: friend.username,
				relationship: friend.relationship,
			}));
		} catch (error) {
			console.error("Error fetching friends:", error);
			throw error;
		}
	}

	// Fetch friend requests
	static async getFriendRequests(): Promise<Friend[]> {
		const token = await auth.getToken();
		try {
			const response = await axios.get(
				`${utils.API_BASE_URL}/users/friends/requests`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			return response.data.map((request: any) => ({
				profile_picture_url: request.profile_picture_url,
				friend_id: request.userID,
				username: request.username,
			}));
		} catch (error) {
			console.error("Error fetching friend requests:", error);
			throw error;
		}
	}

	// Fetch potential friends
	static async getPotentialFriends(): Promise<Friend[]> {
		const token = await auth.getToken();
		try {
			const response = await axios.get(
				`${utils.API_BASE_URL}/users/friends/potential`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			return response.data.map((friend: any) => ({
				profile_picture_url: friend.profile_picture_url,
				friend_id: friend.userID,
				username: friend.username,
				relationship: "mutual",
			}));
		} catch (error) {
			console.error("Error fetching potential friends:", error);
			throw error;
		}
	}

	// Fetch pending friend requests
	static async getPendingRequests(): Promise<Friend[]> {
		const token = await auth.getToken();
		try {
			const response = await axios.get(
				`${utils.API_BASE_URL}/users/friends/pending`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			return response.data.map((request: any) => ({
				profile_picture_url: request.profile_picture_url,
				friend_id: request.userID,
				username: request.username,
				relationship: "pending",
			}));
		} catch (error) {
			console.error("Error fetching pending requests:", error);
			throw error;
		}
	}

	// Send a friend request
	static async handleSendRequest(friend: Friend): Promise<void> {
		const token = await auth.getToken();
		try {
			const response = await fetch(
				`${utils.API_BASE_URL}/users/${friend.username}/befriend`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (response.status !== 201) throw new Error("Failed to send request.");
		} catch (error) {
			console.error("Error sending request:", error);
			throw error;
		}
	}

	// Cancel a friend request
	static async handleCancelRequest(friend: Friend): Promise<void> {
		const token = await auth.getToken();
		try {
			const response = await fetch(
				`${utils.API_BASE_URL}/users/${friend.username}/cancel`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (response.status !== 201) throw new Error("Failed to cancel request.");
		} catch (error) {
			console.error("Error cancelling request:", error);
			throw error;
		}
	}

	// Accept or reject a friend request
	static async handleFriendRequest(
		friend: Friend,
		accept: boolean,
	): Promise<void> {
		const token = await auth.getToken();
		try {
			const response = await fetch(
				`${utils.API_BASE_URL}/users/${friend.username}/${accept ? "accept" : "reject"}`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (response.status !== 201) throw new Error("Failed to handle request.");
		} catch (error) {
			console.error("Error handling friend request:", error);
			throw error;
		}
	}

	// Unfriend a user
	static async handleFriend(friend: Friend): Promise<void> {
		const token = await auth.getToken();
		try {
			const response = await fetch(
				`${utils.API_BASE_URL}/users/${friend.username}/unfriend`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (response.status !== 201) throw new Error("Failed to unfriend.");
		} catch (error) {
			console.error("Error unfriending user:", error);
			throw error;
		}
	}
	// Fetch followers
	static async fetchFollowers(): Promise<Friend[]> {
		const token = await auth.getToken();
		try {
			const response = await axios.get<Friend[]>(
				`${utils.API_BASE_URL}/users/followers`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			return response.data
				.filter(
					(user: any) =>
						user.relationship === "follower" || user.relationship === "mutual",
				)
				.map(
					(user: any): Friend => ({
						profile_picture_url: user.profile_picture_url,
						username: user.username,
						friend_id: user.userID,
						relationship: user.relationship,
					}),
				);
		} catch (error) {
			console.error("Error fetching followers:", error);
			throw error;
		}
	}

	// Fetch following users
	static async fetchFollowing(): Promise<Friend[]> {
		const token = await auth.getToken();
		try {
			// Fetch the users the current user is following
			const followingResponse = await axios.get<Friend[]>(
				`${utils.API_BASE_URL}/users/following`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			// Fetch followers and filter for 'mutual' relationship
			const followers = await this.fetchFollowers(); // Call fetchFollowers method
			const mutualFollowers = followers.filter(
				(follower: Friend) => follower.relationship === "mutual",
			);

			// Combine following and mutual followers
			const combinedFollowing = [
				...followingResponse.data
					.filter((user: any) => user.relationship === "following")
					.map(
						(user: any): Friend => ({
							profile_picture_url: user.profile_picture_url,
							username: user.username,
							friend_id: user.userID,
							relationship: user.relationship,
						}),
					),
				...mutualFollowers, // Add mutual followers to the list
			];

			return combinedFollowing;
		} catch (error) {
			console.error("Error fetching following:", error);
			throw error;
		}
	}

	// Fetch pending friend requests
	static async fetchPendingRequests(): Promise<Friend[]> {
		const token = await auth.getToken();
		try {
			const response = await axios.get<Friend[]>(
				`${utils.API_BASE_URL}/users/friends/pending`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			return response.data.map((user: any) => ({
				profile_picture_url: user.profile_picture_url,
				username: user.username,
				friend_id: user.userID,
				relationship: "pending",
			}));
		} catch (error) {
			console.error("Error fetching pending friend requests:", error);
			throw error;
		}
	}

	// Unfollow a user
	static async handleUnfollow(friend: Friend): Promise<void> {
		const token = await auth.getToken();
		console.log(`User ${utils.API_BASE_URL}/users/${friend.username}/unfollow`);
		if (!token) {
			throw new Error("No token found.");
		}
		try {
			const response = await axios.post(
				`${utils.API_BASE_URL}/users/${friend.username}/unfollow`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!response) throw new Error("Error unfollowing user.");
		} catch (error) {
			console.error("Error unfollowing user:", error);
			throw error;
		}
	}

	// Follow a user
	static async handleFollow(friend: Friend): Promise<void> {
		const token = await auth.getToken();
		if (!token) {
			throw new Error("No token found.");
		}
		try {
			const response = await axios.post(
				`${utils.API_BASE_URL}/users/${friend.username}/follow`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			if (!response) throw new Error("Error unfollowing user.");
		} catch (error) {
			console.error("Error unfollowing user:", error);
			throw error;
		}
	}
}

export default FriendServices;
