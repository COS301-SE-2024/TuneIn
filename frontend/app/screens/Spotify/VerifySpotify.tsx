import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VerifySpotify: React.FC = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams(); // Accessing the email passed from RegisterScreen

  const [verificationCode, setVerificationCode] = useState("");

  const verifyCode = async () => {
    const username = Array.isArray(email) ? email[0] : email; // Handle the case where email might be an array

    try {
      const response = await fetch("YOUR_API_URL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          verificationCode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to verify: ${response.status}`);
      }

      const data = await response.json();
      const { requestToken, refreshToken, expiresIn } = data;
      const expirationDate = Date.now() + expiresIn;

      await AsyncStorage.setItem("Spotify requestToken", requestToken);
      await AsyncStorage.setItem("Spotify refreshToken", refreshToken);
      await AsyncStorage.setItem("Spotify expirationDate", expirationDate.toString());

      Alert.alert("Success!", "Verification successful", [{ text: "OK" }], { cancelable: false });
      navigateToLogin();
    } catch (err) {
      Alert.alert("Error", err.message, [{ text: "OK" }], { cancelable: false });
    }
  };

  const navigateToLogin = () => {
    router.navigate("/screens/SpotifyAuth");
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.logoContainer}>{/* <Text style={styles.logoText}>Logo</Text> */}</View>
      <Text style={styles.headerText}>Verify Your Email</Text>
      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            value={verificationCode}
            onChangeText={setVerificationCode}
            placeholder="Enter the verification code"
          />
        </View>
        <TouchableOpacity style={styles.verifyButton} onPress={verifyCode}>
          <Text style={styles.verifyButtonText}>VERIFY</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerText: {
    padding: 16,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  formContainer: {
    alignItems: "center",
    width: "100%",
  },
  inputGroup: {
    width: "92%",
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    width: "100%",
  },
  verifyButton: {
    width: "92%",
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4C51BF",
    borderRadius: 24,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verifyButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFF",
  },
});

export default VerifySpotify;
