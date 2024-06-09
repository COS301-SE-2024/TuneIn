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
  const [email, setEmail] = useState("");
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
    return re.test(email);
  };

  const handleRegister = () => {
    if (password.length < 8) {
      Alert.alert(
        "Password too short",
        "Password should be at least 8 characters long.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        "Password Mismatch",
        "The passwords do not match. Please try again.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    if (!acceptTerms) {
      Alert.alert(
        "Terms and Conditions",
        "You need to accept the terms and conditions to register.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    if (emailError) {
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    let username = email;
    let attributes = [];

    if (validateEmail(email)) {
      attributes = [
        new CognitoUserAttribute({
          Name: 'email',
          Value: email
        })
      ];
    }

    console.log(username, password, attributes);
    UserPool.signUp(email, password, null, [], (err, data) => {
      if (err) {
        Alert.alert(
          "Error",
          err.message,
          [{ text: "OK" }],
          { cancelable: false }
        );
        router.navigate("/screens/RegisterScreen");
        return;
      }
      router.navigate({
        pathname: "/screens/VerifyEmail",
        params: { email: email },
      });
    });

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
            value={email}
            onChangeText={(text) => {
              setEmail(text);
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
