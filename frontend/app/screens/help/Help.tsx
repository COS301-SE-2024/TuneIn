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


