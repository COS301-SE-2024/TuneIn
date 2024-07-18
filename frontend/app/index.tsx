import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import LoginScreen from "./screens/Auth/LoginScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import * as StorageService from "./services/StorageService";
import auth from "./services/AuthManagement";
import { API_BASE_URL } from "./services/Utils";
import { live } from "./services/Live";

const App: React.FC = () => {
	const router = useRouter();
	const [isCheckingToken, setIsCheckingToken] = useState(true);
	console.log(API_BASE_URL);

	useEffect(() => {
		const checkToken = async () => {
			try {
				const authToken = await StorageService.getItem("backendToken");
				if (authToken && authToken !== "undefined" && authToken !== "null") {
					auth.setToken(authToken);
				}
				live.initialiseSocket();
				// // Perform token validation if necessary
				// if (token) {
				//   // Redirect to the HomeScreen or appropriate route
				//   router.push("/screens/Home");
				// } else {
				// Redirect to the WelcomeScreen or appropriate route
				//router.push("/screens/WelcomeScreen");
				router.push("/screens/Auth/RegisterOther");
				// }
			} catch (error) {
				console.error("Error checking token:", error);
				// Redirect to the WelcomeScreen or appropriate route
				router.push("/screens/WelcomeScreen");
			} finally {
				setIsCheckingToken(false);
			}
		};

		checkToken();
	});

	if (isCheckingToken) {
		// Render a loading indicator while checking the token
		return <WelcomeScreen />;
	}

	// Wrap your App component with PlayerContextProvider to provide global state
	return <LoginScreen />;
};

export default App;
