import React from "react";
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from "expo-router";

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const { width, height } = Dimensions.get('window');

  const navigateToLogin = () => {
    router.navigate("/screens/LoginScreen");
  };

  const navigateToRegister = () => {
    router.navigate("/screens/RegisterScreen");
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/text.jpg')}
        style={{ width, height: height * 0.5 }}
        resizeMode="cover"
      />
      <View style={styles.contentContainer}>
        <Text style={styles.logoText}>Logo</Text>
        <Text style={styles.titleText}>TuneIn</Text>
        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={navigateToLogin}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.registerButton]}
          onPress={navigateToRegister}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  logoText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  button: {
    width: '85%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    marginBottom: 30,
  },
  loginButton: {
    backgroundColor: '#8B8FA8',
  },
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#000000',
    borderWidth: 1,
  },
  loginButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  registerButtonText: {
    fontSize: 16,
    color: '#000000',
  },
});

export default WelcomeScreen;
