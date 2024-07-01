import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./screens/Auth/LoginScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import { PlayerContextProvider } from './screens/PlayerContext'; // Import PlayerContextProvider
import * as StorageService from "./services/StorageService";

const App: React.FC = () => {
  const router = useRouter();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await StorageService.getItem("cognitoToken"); // Use StorageService to get the token
        // // Perform token validation if necessary
        // if (token) {
        //   // Redirect to the HomeScreen or appropriate route
        //   router.push("/screens/Home");
        // } else {
          // Redirect to the WelcomeScreen or appropriate route
          router.push("/screens/WelcomeScreen");
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
  }, []);

  if (isCheckingToken) {
    // Render a loading indicator while checking the token
    return <WelcomeScreen />;
  }

  // Wrap your App component with PlayerContextProvider to provide global state
  return (
    <PlayerContextProvider>
      <LoginScreen />
    </PlayerContextProvider>
  );
};

export default App;
