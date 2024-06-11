import React, { useEffect, useState } from "react";
import { getCurrentUser } from 'aws-amplify/auth'; // Import 'Auth' from 'aws-amplify/auth' instead of 'aws-amplify'
import Home from "./screens/WelcomeScreen";
import LoggedInHome from "./screens/Home"; // replace with your actual logged in home screen
import { Amplify } from '@aws-amplify/core';
import awsconfig from '../src/aws-exports';


Amplify.configure(awsconfig);

export default function App() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
		await getCurrentUser(); // Call 'getCurrentUser' from 'aws-amplify/auth' instead of 'Auth'

    //   await Auth.currentAuthenticatedUser();
      setIsUserLoggedIn(true);
    } catch {
      setIsUserLoggedIn(false);
    }
  };

  return isUserLoggedIn ? <LoggedInHome /> : <Home />;
}
