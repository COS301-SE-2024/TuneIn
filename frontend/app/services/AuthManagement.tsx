import axios from "axios";
import * as StorageService from "./../services/StorageService";
//import decode from "react-native-pure-jwt";
import { jwtDecode } from "jwt-decode";
import * as utils from "./Utils";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
console.log(JWT_SECRET_KEY);
if (!JWT_SECRET_KEY) {
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
		if (this.checkTokenExpiry()) {
			await this.refreshAccessToken();
		}
		return this.token;
	}

	public async checkTokenExpiry(): Promise<boolean> {
		if (!this.token) {
			this.token = await StorageService.getItem("token");
		}

		// Check if token is expired
		console.log("Token:", this.token);
		const decodedToken = decodeToken(this.token);
		console.log("Decoded token:", decodedToken);
		if (!decodedToken || !decodedToken.exp) {
			throw new Error("Failed to decode token");
		}

		const currentTime = Math.floor(Date.now() / 1000);
		return decodedToken.exp > currentTime;
	}

	public async refreshAccessToken(): Promise<void> {
		// Make an API call to refresh the token
		try {
			const response = await axios.post(
				`${utils.getAPIBaseURL()}/auth/refresh`,
				{
					refreshToken: this.token,
				},
			);
			const newToken = response.data.token;
			if (newToken) {
				this.setToken(newToken);
			}
		} catch (error) {
			console.error("Failed to refresh access token:", error);
		}
	}
}

function decodeToken(token: string): any {
	try {
		//return decode.decode(token, JWT_SECRET_KEY);
		return jwtDecode(token);
	} catch (error) {
		console.error("Failed to decode token:", error);
		return null;
	}
}

export default new AuthManagement();
