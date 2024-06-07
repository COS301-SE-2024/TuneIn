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
import { useRouter, useNavigation } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { CheckBox } from "react-native-elements";

const LoginScreen: React.FC = () => {
  const [obscureText, setObscureText] = useState(true);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const navigation = useNavigation();

  const navigateToRegister = () => {
    router.navigate("/screens/RegisterScreen");
  };

  const handleLogin = () => {
    // Check if email is verified
    const isEmailVerified = false; // Change to true if email is verified

    if (isEmailVerified) {
      // Implement login functionality here
      router.push("/Home");
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        {/* <Text style={styles.logoText}>Logo</Text> */}
      </View>
      <Text style={styles.title}>Welcome Back to TuneIn</Text>
      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email or Username</Text>
          <TextInput
            style={styles.input}
            value={emailOrUsername}
            onChangeText={setEmailOrUsername}
            placeholder="Enter your email or username"
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
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => {
            // Implement forgot password functionality here
          }}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        <View style={styles.checkboxContainer}>
          <CheckBox
            title="Remember Me"
            checked={rememberMe}
            onPress={() => setRememberMe(!rememberMe)}
            containerStyle={styles.checkbox}
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.registerRedirect}
          onPress={navigateToRegister}
        >
          <Text style={styles.registerText}>
            Don’t have an account?{" "}
            <Text style={styles.registerLink}>Register Now</Text>
          </Text>
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
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginRight: "7.5%",
  },
  forgotPasswordText: {
    color: "black",
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
  loginButton: {
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
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerRedirect: {
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: "black",
  },
  registerLink: {
    fontWeight: "bold",
  },
});

export default LoginScreen;
