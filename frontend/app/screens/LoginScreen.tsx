import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { CheckBox } from "react-native-elements";

const LoginScreen: React.FC = () => {
  const [obscureText, setObscureText] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const navigateToHome = () => {
    router.navigate("/screens/Home");
  };

  const navigateToRegister = () => {
    router.navigate("/screens/RegisterScreen");
  };

  return (
    <ScrollView className="flex-1 p-4">
      <TouchableOpacity className="absolute top-4 left-4 z-10" onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View className="items-center mb-10">
        {/* <Text style={styles.logoText}>Logo</Text> */}
      </View>
      <Text className="p-4 text-2xl font-bold text-center mb-10">
        Welcome Back to TuneIn
      </Text>
      <View className="items-center w-full">
        <View className="w-11/12 mb-5">
          <Text className="text-lg font-bold mb-2">Email or Username</Text>
          <TextInput
            className="p-3 border-b border-gray-400 w-full"
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            placeholder="Enter your email or username"
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
        <TouchableOpacity
          className="self-end mr-10"
          onPress={() => {
            // Implement forgot password functionality here
          }}
        >
          <Text className="text-black">Forgot Password?</Text>
        </TouchableOpacity>
        <View className="w-11/12 mb-5">
          <CheckBox
            className="bg-transparent border-0 p-0"
            title="Remember Me"
            checked={rememberMe}
            onPress={() => setRememberMe(!rememberMe)}
          />
        </View>
        <TouchableOpacity
          className="w-11/12 h-12 justify-center items-center bg-indigo-700 rounded-full mb-5 shadow-lg"
          onPress={navigateToHome}
        >
          <Text className="text-white text-lg font-bold">LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="mt-5"
          onPress={navigateToRegister}
        >
          <Text className="text-lg text-black">
            Don’t have an account?{" "}
            <Text className="font-bold">Register Now</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;
