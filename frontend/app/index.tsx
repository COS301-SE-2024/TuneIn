import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./screens/LoginScreen";
import WelcomeScreen from "./screens/WelcomeScreen"; // Import the WelcomeScreen if it's used

const App: React.FC = () => {
  const router = useRouter();
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("cognitoToken");
        // if (token) {
        //   // Validate token if necessary
        //   router.push("/screens/Home");
        // } else {
          router.push("/screens/WelcomeScreen");
        // }
      } catch (error) {
        console.error("Error checking token:", error);
        router.push("/screens/WelcomeScreen");
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkToken();
  }, []);

  if (isCheckingToken) {
    // You can render a loading indicator while checking the token
    return <WelcomeScreen />;
  }

  return <LoginScreen />;
};

export default App;
