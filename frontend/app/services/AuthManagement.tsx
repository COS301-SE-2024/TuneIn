import axios from "axios";
import * as StorageService from "./../services/StorageService";
import { jwtDecode } from "jwt-decode";
import * as utils from "./Utils";
import { JWT_SECRET_KEY } from "react-native-dotenv";
import { router } from "expo-router";
import { ToastAndroid } from "react-native";

const jwtSecretKey = JWT_SECRET_KEY;
if (!jwtSecretKey) {
	throw new Error(
		"No JWT Secret (JWT_SECRET_KEY) provided in environment variables",
	);
}

class AuthManagement {
	private static instance: AuthManagement;
	private token: string | null = null;
	public tokenSet: boolean = false;

	constructor() {
		console.log("AuthManagement constructor is calling fetchToken");
		//console.trace();
		this.fetchToken().then(() => {
			console.log("AuthManagement constructor fetchToken resolved");
		});
	}

	public static getInstance(): AuthManagement {
		if (!AuthManagement.instance) {
			AuthManagement.instance = new AuthManagement();
		}
		return AuthManagement.instance;
	}

	private async fetchToken(): Promise<void> {
		this.token = await StorageService.getItem("token");
		if (
			this.token !== null &&
			this.token !== "undefined" &&
			this.token !== "null"
		) {
			this.tokenSet = true;
		}
	}

	public authenticated(): boolean {
		return this.token !== null;
	}

	public logout(): void {
		// literally the safety cord of this service
		// users will be logged out and redirected to the welcome screen if there is any issue with the token
		// alert("Something went wrong with the authentication. Please log in again.");
		this.token = null;
		console.log("Clearing from logout");
		StorageService.clear();
		this.tokenSet = false;
		router.navigate("/screens/WelcomeScreen");
	}

	public exchangeCognitoToken(
		token: string,
		postLogin: Function,
		callPostLogin: boolean,
	): void {
		// POST request to backend
		fetch(`${utils.API_BASE_URL}/auth/login`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				token: token,
			}),
		})
			.then((response) => response.json())
			.then((data) => {
				const token = data.token; // Extract the token from the response
				this.setToken(token); // Set the token in the AuthManagement service
				if (callPostLogin) {
					postLogin();
				}
			})
			.catch((error) => {
				console.error("Failed to exchange Cognito token:", error);
				throw new Error("Failed to exchange Cognito token");
			});
	}

	public async setToken(token: string): Promise<void> {
		this.token = token;
		StorageService.setItem("token", token);
		this.tokenSet = true;
	}

	public async getToken(): Promise<string | null> {
		try {
			if (await this.checkTokenExpiry()) {
				await this.refreshAccessToken();
			}

			console.log("Token:", this.token);
			console.log("Token expiry:", await this.checkTokenExpiry());
			return this.token;
		} catch (error) {
			console.error("Failed to get token:", error);
			this.logout();
			return null;
		}
	}

	private async checkTokenExpiry(): Promise<boolean> {
		if (!this.token || this.token === null) {
			this.token = await StorageService.getItem("token");
		}

		if (!this.token || this.token === null) {
			throw new Error("No token found");
		}

		// Check if token is expired
		// console.log("Token:", this.token);
		const decodedToken = decodeToken(this.token);
		// console.log("Decoded token:", decodedToken);
		if (!decodedToken || !decodedToken.exp) {
			throw new Error("Failed to decode token");
		}

		const currentTime = Math.floor(Date.now() / 1000);
		return currentTime >= decodedToken.exp;
	}

	private async refreshAccessToken(): Promise<void> {
		// Make an API call to refresh the token
		if (this.token && this.token !== null) {
			try {
				const response = await axios.post(
					`${utils.API_BASE_URL}/auth/refresh`,
					{
						refreshToken: this.token,
					},
				);
				const newToken = response.data.token;
				if (newToken) {
					this.setToken(newToken);
				}
			} catch (error) {
				console.log("Failed to refresh access token:", error);
				ToastAndroid.show("Failed to refresh access token", ToastAndroid.SHORT);
			}
		}
	}
}

function decodeToken(token: string | null): any {
	if (token) {
		try {
			//return decode.decode(token, JWT_SECRET_KEY);
			return jwtDecode(token);
		} catch (error) {
			console.error("Failed to decode token:", error);
			return null;
		}
	}
}

export default AuthManagement.getInstance();
