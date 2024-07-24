import axios from "axios";
import * as StorageService from "./../services/StorageService";
//import decode from "react-native-pure-jwt";
import { jwtDecode } from "jwt-decode";
import * as utils from "./Utils";
import { JWT_SECRET_KEY } from "react-native-dotenv";
import { live } from "./Live";

const jwtSecretKey = JWT_SECRET_KEY;
if (!jwtSecretKey) {
	throw new Error(
		"No JWT Secret (JWT_SECRET_KEY) provided in environment variables",
	);
}

class AuthManagement {
	private token: string | null = null;

	public async setToken(token: string): Promise<void> {
		this.token = token;
		StorageService.setItem("token", token);
	}

	public async getToken(): Promise<string | null> {
		if (await this.checkTokenExpiry()) {
			await this.refreshAccessToken();
		}

		console.log("Token:", this.token);
		console.log("Token expiry:", await this.checkTokenExpiry());
		return this.token;
	}

	public async checkTokenExpiry(): Promise<boolean> {
		if (!this.token || this.token === null) {
			this.token = await StorageService.getItem("token");
		}

		if (!this.token || this.token === null) {
			throw new Error("No token found");
		}

		// Check if token is expired
		console.log("Token:", this.token);
		const decodedToken = decodeToken(this.token);
		console.log("Decoded token:", decodedToken);
		if (!decodedToken || !decodedToken.exp) {
			throw new Error("Failed to decode token");
		}

		const currentTime = Math.floor(Date.now() / 1000);
		return currentTime >= decodedToken.exp;
	}

	public async refreshAccessToken(): Promise<void> {
		// Make an API call to refresh the token
		try {
			const response = await axios.post(`${utils.API_BASE_URL}/auth/refresh`, {
				refreshToken: this.token,
			});
			const newToken = response.data.token;
			if (newToken) {
				this.setToken(newToken);
			}
		} catch (error) {
			console.error("Failed to refresh access token:", error);
		}
	}

	public async postAuthInit(): Promise<void> {
		live.initialiseSocket();
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

export default new AuthManagement();
