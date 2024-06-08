import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { CheckBox } from "react-native-elements";
import UserPool from '../services/UserPool';
import { CognitoUser, CognitoUserAttribute } from "amazon-cognito-identity-js";

const RegisterScreen: React.FC = () => {
  const [obscureText, setObscureText] = useState(true);
  const [obscureTextConfirm, setObscureTextConfirm] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [username, setUsername] = useState(""); // [username, setUsername
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState(true);

  const router = useRouter();


  const navigateToLogin = () => {

    router.navigate("/screens/LoginScreen");
  };

  const generateUniqueUsername = () => {
    // generate a unique username
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const validateEmail = (email: string) => {
    // user regex to check if email is valid
    // use email regex to check if email is valid
    const re: RegExp = /\S+@\S+\.\S+/;
    console.log(re.test(email), email);
    return re.test(email);
  };

  const handleRegister = () => {
    // Check if passwords match
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
      // alert("Password Mismatch");
      console.error("Password Mismatch");
      Alert.alert(
        "Password Mismatch",
        "The passwords do not match. Please try again.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }

    // Check if terms are accepted
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

    if(emailError){
      console.error("Invalid Email");
      Alert.alert(
        "Invalid Email",
        "Please enter a valid email address",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }; 

    // aws cognito signup with email or username and password

    // If the input is an email, use a non-email username and add the email as an attribute

    const attributes = [
      new CognitoUserAttribute({
        Name: 'email',
        Value: emailOrUsername
      }),
      new CognitoUserAttribute({
        Name: 'preferred_username',
        Value: username
      })
    ];
  
    console.log(username, password, attributes);
    UserPool.signUp(username, password, attributes, [], (err, data) => {
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

    // Check if email is verified
    const isEmailVerified = false; // Change to true if email is verified

    if (isEmailVerified) {
      console.log("Email Verified");
      // Implement register functionality here
      router.navigate("/screens/Login");
    } else {
      // Show alert if email is not verified
      Alert.alert(
        "Email Verification Required",
        "Please verify your email before you can continue.",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        {/* <Text style={styles.logoText}>Logo</Text> */}
      </View>
      <Text style={styles.title}>Join the Fastest Growing Listening Community</Text>
      <View style={styles.form}>
      <View style={styles.inputWrapper}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={emailOrUsername}
            onChangeText={(text) => {
              setUsername(text);
            }}
            placeholder="Create a new username"
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={emailOrUsername}
            onChangeText={(text) => {
              setEmailOrUsername(text);
              setEmailError(!validateEmail(text));
            }}
            placeholder="Enter your email"
          />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="*********"
              secureTextEntry={obscureText}
            />
            <TouchableOpacity
              style={styles.icon}
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
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="*********"
              secureTextEntry={obscureTextConfirm}
            />
            <TouchableOpacity
              style={styles.icon}
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
        <View style={styles.checkboxContainer}>
          <CheckBox
            title="Accept Terms and Conditions"
            checked={acceptTerms}
            onPress={() => setAcceptTerms(!acceptTerms)}
            containerStyle={styles.checkbox}
          />
        </View>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginRedirect} onPress={navigateToLogin}>
        <Text style={styles.loginRedirectText}>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </TouchableOpacity>
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
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    padding: 10,
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    alignItems: "center",
    width: "100%",
  },
  inputWrapper: {
    width: "85%",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "gray",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  icon: {
    position: "absolute",
    right: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    marginBottom: 20,
  },
  checkbox: {
    backgroundColor: "transparent",
    borderWidth: 0,
    padding: 0,
  },
  registerButton: {
    width: "85%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8B8FA8",
    borderRadius: 30,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loginRedirect: {
    marginTop: 20,
  },
  loginRedirectText: {
    fontSize: 16,
    color: "black",
    textAlign: "center",
  },
  loginLink: {
    fontWeight: "bold",
  },
});

export default RegisterScreen;
