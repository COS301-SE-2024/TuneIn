import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ForgotPasswordScreen: React.FC = () => {
  const router = useRouter();

  const navigateToOTP = () => {
    router.push('screens/OTP');
  };

  const navigateToLogin = () => {
    router.push('screens/LoginScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Text style={styles.welcomeText}>Forgot Password?</Text>
      <Text style={styles.instructionText}>
        Don't worry! It happens. Please enter your email address to receive a verification code.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.sendCodeButton} onPress={navigateToOTP}>
          <Text style={styles.sendCodeText}>Send Code</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.registerContainer} onPress={navigateToLogin}>
          <Text style={styles.registerText}>
            Remember Password? <Text style={styles.registerBoldText}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 'auto',
  },
  backText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins_500Medium',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 30,
  },
  input: {
    height: 50,
    borderBottomColor: '#888',
    borderBottomWidth: 1,
    marginHorizontal: 30, // Add horizontal margin
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Poppins_500Medium',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  sendCodeButton: {
    backgroundColor: '#330066',
    borderRadius: 30,
    paddingVertical: 15,
    width: '85%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  sendCodeText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  registerContainer: {
    alignItems: 'center',
  },
  registerText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins_500Medium',
  },
  registerBoldText: {
    fontWeight: 'bold',
    fontFamily: 'Poppins_700Bold',
  },
});

export default ForgotPasswordScreen;
