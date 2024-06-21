
import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoginScreen from "./screens/LoginScreen";

const App: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("cognitoToken");
    //   if (token) {
    //     // Validate token (if needed)
    //     router.push("/screens/Home");
    //   } else {
        router.push("/screens/WelcomeScreen");
    //   }
    };

    checkToken();
  }, []);

  return (
    <LoginScreen />
  );
};

export default App;
