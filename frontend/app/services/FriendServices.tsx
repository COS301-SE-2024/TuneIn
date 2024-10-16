import axios from "axios";
import auth from "./AuthManagement";
import * as utils from "./Utils";
import { Friend } from "../models/friend";
import { Alert, Platform, ToastAndroid } from "react-native";

class FriendServices {
	static showErrorMessage(message: string): void {
		if (Platform.OS === "android") {
			ToastAndroid.show(message, ToastAndroid.SHORT);
		} else if (Platform.OS === "web") {
			alert(message);
		} else {
			Alert.alert("Error", message);
		}
	}
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
			this.showErrorMessage("Error fetching friends.");
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
			this.showErrorMessage("Error fetching friend requests.");
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
			this.showErrorMessage("Error fetching potential friends.");
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
			this.showErrorMessage("Error fetching pending friend requests.");
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
			if (response.status !== 201) {
				console.log("Failed to send request.");
			}
			return;
		} catch (error) {
			this.showErrorMessage("Error sending request.");
			console.log("Error sending request:", error);
		}
	}

	// Cancel a friend request
	static async handleCancelRequest(friend: Friend): Promise<void> {
		const token = await auth.getToken();
		try {
			await fetch(`${utils.API_BASE_URL}/users/${friend.username}/cancel`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
			});
			// if (response.status !== 201) throw new Error("Failed to cancel request.");
		} catch (error) {
			this.showErrorMessage("Error cancelling request.");
			console.log("Error cancelling request:", error);
		}
	}

	// Accept or reject a friend request
	static async handleFriendRequest(
		friend: Friend,
		accept: boolean,
	): Promise<void> {
		const token = await auth.getToken();
		try {
			await fetch(
				`${utils.API_BASE_URL}/users/${friend.username}/${accept ? "accept" : "reject"}`,
				{
					method: "POST",
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			// if (response.status !== 201) throw new Error("Failed to handle request.");
		} catch (error) {
			this.showErrorMessage("Error handling request.");
			// throw error;
		}
	}

	// Unfriend a user
	static async handleFriend(friend: Friend): Promise<void> {
		const token = await auth.getToken();
		try {
			await fetch(`${utils.API_BASE_URL}/users/${friend.username}/unfriend`, {
				method: "POST",
				headers: { Authorization: `Bearer ${token}` },
			});
			// if (response.status !== 201) throw new Error("Failed to unfriend.");
		} catch (error) {
			this.showErrorMessage("Error unfriending user.");
			// throw error;
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
			this.showErrorMessage("Error fetching followers.");
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
			this.showErrorMessage("Error fetching following.");
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
			this.showErrorMessage("Error fetching pending requests.");
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
			await axios.post(
				`${utils.API_BASE_URL}/users/${friend.username}/unfollow`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			// if (!response) throw new Error("Error unfollowing user.");
		} catch (error) {
			this.showErrorMessage("Error unfollowing user.");
			// throw error;
		}
	}

	// Follow a user
	static async handleFollow(friend: Friend): Promise<void> {
		const token = await auth.getToken();
		if (!token) {
			throw new Error("No token found.");
		}
		try {
			await axios.post(
				`${utils.API_BASE_URL}/users/${friend.username}/follow`,
				{},
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			// if (!response) throw new Error("Error unfollowing user.");
		} catch (error) {
			this.showErrorMessage("Error following user.");
			// throw error;
		}
	}
}

export default FriendServices;
