import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./screens/LoginScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import { PlayerContextProvider } from './screens/PlayerContext'; // Import PlayerContextProvider

const App: React.FC = () => {
  const router = useRouter();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("cognitoToken");
<<<<<<< Updated upstream
        // Perform token validation if necessary
        if (token) {
          // Redirect to the HomeScreen or appropriate route
          router.push("/screens/HomeScreen");
        } else {
          // Redirect to the WelcomeScreen or appropriate route
=======
        if (token) {
          // Validate token if necessary
          router.push("/screens/Home");
        } else {
>>>>>>> Stashed changes
          router.push("/screens/WelcomeScreen");
        }
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
