// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Alert,
//   StyleSheet,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { MaterialIcons } from "@expo/vector-icons";
// import { CheckBox } from "react-native-elements";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import UserPool from "../services/UserPool";
// import { AuthenticationDetails, CognitoUser } from "amazon-cognito-identity-js";
// import { Ionicons } from "@expo/vector-icons";
// import axios from "axios";

// const LoginScreen: React.FC = () => {
//   const [obscureText, setObscureText] = useState(true);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [emailOrUsername, setEmailOrUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const router = useRouter();

//   const navigateToHome = () => {
//     console.log(emailOrUsername, password);
//     const userData = {
//       Username: emailOrUsername,
//       Pool: UserPool,
//     };

//     const cognitoUser = new CognitoUser(userData);

//     const authenticationData = {
//       Username: emailOrUsername,
//       Password: password,
//     };
//     const authenticationDetails = new AuthenticationDetails(authenticationData);
//     cognitoUser.authenticateUser(authenticationDetails, {
//       onSuccess: function (result) {
//         console.log(
//           "access token + " + result.getAccessToken().getJwtToken()
//         );

//         console.log(
//           "result.getAccessToken().decodePayload()",
//           result.getAccessToken().decodePayload()
//         );

//         // Store token in AsyncStorage if remember me is checked
//         if (rememberMe) {
//           AsyncStorage.setItem(
//             "cognitoToken",
//             result.getAccessToken().getJwtToken()
//           );
//         }

//         // POST request to backend
//         fetch("http://172.16.12.166:3000/auth/login", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             token: result.getAccessToken().getJwtToken(),
//           }),
//         })
//           .then((response) => response.json())
//           .then((data) => {
//             const token = data.token; // Extract the token from the response
//             AsyncStorage.setItem("token", token); // Save the token to AsyncStorage
//             router.navigate("/screens/Home");
//           })
//           .catch((error) => {
//             console.error("Error:", error);
//           });
//       },
//       onFailure: function (err) {
//         console.error(err);
//       },
//     });
//   };

//   const navigateToRegister = () => {
//     router.navigate("/screens/RegisterScreen");
//   };

//   const navigateToForgot = () => {
//     router.navigate("/screens/ForgotPassword");
//   };

//   return (
//     <ScrollView style={styles.container}>
//       <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
//         <Ionicons name="chevron-back" size={24} color="black" />
//       </TouchableOpacity>
//       <View style={styles.logoContainer}>{/* <Text style={styles.logoText}>Logo</Text> */}</View>
//       <Text style={styles.headerText}>Welcome Back to TuneIn</Text>
//       <View style={styles.formContainer}>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Email or Username</Text>
//           <TextInput
//             style={styles.input}
//             value={emailOrUsername}
//             onChangeText={setEmailOrUsername}
//             placeholder="Enter your email or username"
//           />
//         </View>
//         <View style={styles.inputGroup}>
//           <Text style={styles.label}>Password</Text>
//           <View style={styles.passwordContainer}>
//             <TextInput
//               style={styles.passwordInput}
//               value={password}
//               onChangeText={setPassword}
//               placeholder="*********"
//               secureTextEntry={obscureText}
//             />
//             <TouchableOpacity
//               style={styles.visibilityToggle}
//               onPress={() => setObscureText(!obscureText)}
//             >
//               <MaterialIcons
//                 name={obscureText ? "visibility-off" : "visibility"}
//                 size={24}
//                 color="gray"
//               />
//             </TouchableOpacity>
//           </View>
//         </View>
//         <TouchableOpacity style={styles.forgotPasswordButton} onPress={navigateToForgot}>
//           <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
//         </TouchableOpacity>
//         <View style={styles.inputGroup}>
//           <CheckBox
//             containerStyle={styles.checkboxContainer}
//             title="Remember Me"
//             checked={rememberMe}
//             onPress={() => setRememberMe(!rememberMe)}
//           />
//         </View>
//         <TouchableOpacity style={styles.loginButton} onPress={navigateToHome}>
//           <Text style={styles.loginButtonText}>LOGIN</Text>
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.registerLink} onPress={navigateToRegister}>
//           <Text style={styles.registerLinkText}>
//             Don’t have an account?{" "}
//             <Text style={styles.registerLinkBold}>Register Now</Text>
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//   },
//   backButton: {
//     position: "absolute",
//     top: 16,
//     left: 16,
//     zIndex: 10,
//   },
//   logoContainer: {
//     alignItems: "center",
//     marginBottom: 40,
//   },
//   headerText: {
//     padding: 16,
//     fontSize: 32,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 40,
//   },
//   formContainer: {
//     alignItems: "center",
//     width: "100%",
//   },
//   inputGroup: {
//     width: "92%",
//     marginBottom: 20,
//   },
//   label: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginBottom: 8,
//   },
//   input: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "gray",
//     width: "100%",
//   },
//   passwordContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: "100%",
//   },
//   passwordInput: {
//     flex: 1,
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "gray",
//   },
//   visibilityToggle: {
//     position: "absolute",
//     right: 12,
//   },
//   forgotPasswordButton: {
//     alignSelf: "flex-end",
//     marginRight: 16,
//   },
//   forgotPasswordText: {
//     color: "black",
//   },
//   checkboxContainer: {
//     backgroundColor: "transparent",
//     borderWidth: 0,
//     padding: 0,
//   },
//   loginButton: {
//     width: "92%",
//     height: 48,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#4C51BF",
//     borderRadius: 24,
//     marginBottom: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   loginButtonText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#FFF",
//   },
//   registerLink: {
//     marginTop: 20,
//   },
//   registerLinkText: {
//     fontSize: 18,
//     textAlign: "center",
//   },
//   registerLinkBold: {
//     fontWeight: "bold",
//   },
// });

// export default LoginScreen;


import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const menuItems = [
  {
    title: 'Getting Started',
    icon: '🚀',
    subcategories: [
      { title: 'Introduction', screen: 'GettingStarted' },
      { title: 'Creating an Account', screen: 'GettingStarted' },
      { title: 'Logging In', screen: 'GettingStarted' },
    ],
    route: '/screens/help/GettingStarted'
  },
  {
    title: 'Profile Management',
    icon: '👤',
    subcategories: [
      { title: 'Creating and Updating Your Profile', screen: 'ProfileManagement' },
      { title: 'Music Preferences', screen: 'ProfileManagement' },
      { title: 'Personalized Recommendations', screen: 'ProfileManagement' },
    ],
    route: '/help/ProfileManagement'
  },
  {
    title: 'Interactive Sessions/Rooms',
    icon: '🎤',
    subcategories: [
      { title: 'Creating Rooms', screen: 'InteractiveSessions' },
      { title: 'Room Settings', screen: 'InteractiveSessions' },
      { title: 'Joining Rooms', screen: 'InteractiveSessions' },
      { title: 'Managing Rooms', screen: 'InteractiveSessions' },
    ],
    route: '/help/InteractiveSessions'
  },
  // ... (Add more sections here)
];

export default function HelpMenu() {
  const router = useRouter();

  const navigateToScreen = (screen) => {
    router.push(`/${screen}`);
  };

  // const navigateToRegister = () => {
	// 	router.navigate("/screens/help/ProfileManagement");
	// };

  // const navigateToRegister = () => {
	// 	router.navigate("/screens/help/GettingStarted");
	// };

  const navigateToRegister = () => {
		router.navigate("/screens/help/RoomInteraction");
	};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Help Center</Text>
      {menuItems.map((item, index) => (
        <View key={index} style={styles.section}>
          <TouchableOpacity
            style={styles.header}
            onPress={() => navigateToScreen(item.route)}
          >
            <Text style={styles.headerText}>{item.icon} {item.title}</Text>
          </TouchableOpacity>
          {item.subcategories.map((subcategory, subIndex) => (
            <TouchableOpacity
              key={subIndex}
              style={styles.subcategory}
              onPress={() => navigateToScreen(subcategory.screen)}
            >
              <Text style={styles.subcategoryText}>{subcategory.title}</Text>

              
            </TouchableOpacity>
            
          ))}

<TouchableOpacity style={styles.registerButton} onPress={navigateToRegister}>
					<Text style={styles.registerButtonText}>Register</Text>
				</TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subcategory: {
    paddingVertical: 5,
  },
  subcategoryText: {
    fontSize: 16,
    color: '#007bff',
  },
  registerButton: {
		width: "92%",
		height: 48,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#FFF",
		borderColor: "#000",
		borderWidth: 1,
		borderRadius: 24,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	registerButtonText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#000",
	},
});


