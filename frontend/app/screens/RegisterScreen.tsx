import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { CheckBox } from "react-native-elements";
import UserPool from '../services/UserPool';
import { CognitoUserAttribute } from "amazon-cognito-identity-js";

const RegisterScreen: React.FC = () => {
  const [obscureText, setObscureText] = useState(true);
  const [obscureTextConfirm, setObscureTextConfirm] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState(true);

  const router = useRouter();

  const navigateToLogin = () => {
    router.navigate("/screens/LoginScreen");
  };

  const generateUniqueUsername = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const validateEmail = (email: string) => {
    const re: RegExp = /\S+@\S+\.\S+/;
    console.log(re.test(email), email);
    return re.test(email);
  };

  const handleRegister = () => {
    console.log(emailOrUsername, password, confirmPassword);
    if (password.length < 8) {
      console.error("Password too short");
      Alert.alert(
        "Password too short",
        "Password should be at least 8 characters long.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    if (password !== confirmPassword) {
      console.error("Password Mismatch");
      Alert.alert(
        "Password Mismatch",
        "The passwords do not match. Please try again.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    if (!acceptTerms) {
      console.error("Terms and Conditions not accepted");
      Alert.alert(
        "Terms and Conditions",
        "You need to accept the terms and conditions to register.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    if (emailError) {
      console.error("Invalid Email");
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    // aws cognito signup with email or username and password
    // let username = emailOrUsername;
    let attributes = [];

      attributes = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: emailOrUsername
        })
      ];
    console.log(username, password, attributes);
    UserPool.signUp(emailOrUsername, password, null, [], (err, data) => {
      if (err) {
        console.error(err);
        Alert.alert(
          "Error",
          err.message,
          [{ text: "OK" }],
          { cancelable: false }
        );
        return;
      }
      console.log(data);
      Alert.alert(
        "Success",
        "Please check your email for a verification link.",
        [{ text: "OK" }],
        { cancelable: false }
      );
    });

    const isEmailVerified = false;

    if (isEmailVerified) {
      console.log("Email Verified");
      router.navigate("/screens/Login");
    } else {
      Alert.alert(
        "Email Verification Required",
        "Please verify your email before you can continue.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
  };

  return (
    <ScrollView className="flex-1 p-4">
      <TouchableOpacity className="absolute top-4 left-4 z-10" onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View className="items-center mb-10">
        {/* Add Logo Component Here */}
      </View>
      <Text className="p-4 text-2xl font-bold text-center mb-10">
        Join the Fastest Growing Listening Community
      </Text>
      <View className="items-center w-full">
        <View className="w-11/12 mb-5">
          <Text className="text-lg font-bold mb-2">Username</Text>
          <TextInput
            className="p-3 border-b border-gray-400 w-full"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
            }}
            placeholder="Create a new username"
          />
        </View>
        <View className="w-11/12 mb-5">
          <Text className="text-lg font-bold mb-2">Email</Text>
          <TextInput
            className="p-3 border-b border-gray-400 w-full"
            value={emailOrUsername}
            onChangeText={(text) => {
              setEmailOrUsername(text);
              setEmailError(!validateEmail(text));
            }}
            placeholder="Enter your email"
          />
        </View>
        <View className="w-11/12 mb-5">
          <Text className="text-lg font-bold mb-2">Password</Text>
          <View className="flex-row items-center w-full">
            <TextInput
              className="p-3 flex-1 border-b border-gray-400"
              value={password}
              onChangeText={setPassword}
              placeholder="*********"
              secureTextEntry={obscureText}
            />
            <TouchableOpacity
              className="absolute right-3"
              onPress={() => setObscureText(!obscureText)}
            >
              <MaterialIcons
                name={obscureText ? "visibility-off" : "visibility"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View className="w-11/12 mb-5">
          <Text className="text-lg font-bold mb-2">Confirm Password</Text>
          <View className="flex-row items-center w-full">
            <TextInput
              className="p-3 flex-1 border-b border-gray-400"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="*********"
              secureTextEntry={obscureTextConfirm}
            />
            <TouchableOpacity
              className="absolute right-3"
              onPress={() => setObscureTextConfirm(!obscureTextConfirm)}
            >
              <MaterialIcons
                name={obscureTextConfirm ? "visibility-off" : "visibility"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>
        </View>
        <View className="w-11/12 mb-5">
          <CheckBox
            className="bg-transparent border-0 p-0"
            title="Accept Terms and Conditions"
            checked={acceptTerms}
            onPress={() => setAcceptTerms(!acceptTerms)}
          />
        </View>
        <TouchableOpacity
          className="w-11/12 h-12 justify-center items-center bg-indigo-700 rounded-full mb-5 shadow-lg"
          onPress={handleRegister}
        >
          <Text className="text-white text-lg font-bold">REGISTER</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity className="mt-5" onPress={navigateToLogin}>
        <Text className="text-lg text-black text-center">
          Already have an account? <Text className="font-bold">Login</Text>
        </Text>
      </TouchableOpacity>
      <View className="mb-20" />
    </ScrollView>
  );
};

export default RegisterScreen;
