import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { CheckBox } from 'react-native-elements';
import { StackNavigationProp } from '@react-navigation/stack';

const RegisterScreen: React.FC = () => {
  const [obscureText, setObscureText] = useState(true);
  const [obscureTextConfirm, setObscureTextConfirm] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  //onst navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Register'>>();

  const { width } = Dimensions.get('window');

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        Join the Fastest Growing Listening Community
      </Text>
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
                name={obscureText ? 'visibility-off' : 'visibility'}
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
                name={obscureTextConfirm ? 'visibility-off' : 'visibility'}
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
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => {
            // Implement register functionality here
          }}
        >
          <Text style={styles.registerButtonText}>REGISTER</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={styles.loginRedirect}
       // onPress={() => navigation.navigate('Login')}
      >
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
  title: {
    padding: 10,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
  },
  form: {
    alignItems: 'center',
  },
  inputWrapper: {
    width: '85%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: 'gray',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    right: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    marginBottom: 20,
  },
  checkbox: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
  },
  registerButton: {
    width: '85%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#8B8FA8',
    borderRadius: 30,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginRedirect: {
    marginTop: 20,
  },
  loginRedirectText: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  loginLink: {
    fontWeight: 'bold',
  },
});

export default RegisterScreen;