import React, { useState} from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView,Alert } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CognitoUser } from "amazon-cognito-identity-js";
import UserPool from '../services/UserPool';

const VerifyEmailScreen: React.FC = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams(); // Accessing the email passed from RegisterScreen

    const [verificationCode, setVerificationCode] = useState("");

    const verifyCode = () => {
        const username = Array.isArray(email) ? email[0] : email; // Handle the case where email might be an array
        const cognitoUser = new CognitoUser({ Username: username, Pool: UserPool });
        cognitoUser.confirmRegistration(verificationCode, true, (err, result) => {
            if (err) {
                Alert.alert(
                    "Error",
                    err.message,
                    [{ text: "OK" }],
                    { cancelable: false }
                  );
                return;
            }
            Alert.alert(
                "Success!",
                "Verification successful",
                [{ text: "OK" }],
                { cancelable: false }
              );
            navigateToLogin();
        });
    };

    const navigateToLogin = () => {
        router.navigate("/screens/LoginScreen");
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
                Verify Your Email
            </Text>
            <View className="items-center w-full">
                <View className="w-11/12 mb-5">
                    <Text className="text-lg font-bold mb-2">Verification Code</Text>
                    <TextInput
                        className="p-3 border-b border-gray-400 w-full"
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                        placeholder="Enter the verification code"
                    />
                </View>
                <TouchableOpacity
                    className="w-11/12 h-12 justify-center items-center bg-indigo-700 rounded-full mb-5 shadow-lg"
                    onPress={verifyCode}
                >
                    <Text className="text-white text-lg font-bold">VERIFY</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default VerifyEmailScreen;
