import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter from 'expo-router'

const AdvancedSettings = () => {
  const router = useRouter(); // Initialize router instance
  const [selectedOption, setSelectedOption] = useState(null);
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(true);
  const [toggle3, setToggle3] = useState(true);
  const [toggle4, setToggle4] = useState(true);

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const toggleSwitch1 = () => setToggle1(previousState => !previousState);
  const toggleSwitch2 = () => setToggle2(previousState => !previousState);
  const toggleSwitch3 = () => setToggle3(previousState => !previousState);
  const toggleSwitch4 = () => setToggle4(previousState => !previousState);

  const goToEditScreen = () => {
    // Navigate to edit screen
    router.navigate("/screens/EditRoomInfo");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeButton}>×</Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Advanced Settings</Text>
      </View>

      <Text style={styles.sectionHeader}>Who can join your room?</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.option, selectedOption === 1 && styles.selectedOption]}
          onPress={() => handleOptionSelect(1)}>
          <Text style={styles.optionText}>Everyone</Text>
          {selectedOption === 1 && <Text> ✓ </Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, selectedOption === 2 && styles.selectedOption]}
          onPress={() => handleOptionSelect(2)}>
          <Text style={styles.optionText}>People with the link</Text>
          {selectedOption === 2 && <Text> ✓ </Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, selectedOption === 3 && styles.selectedOption]}
          onPress={() => handleOptionSelect(3)}>
          <Text style={styles.optionText}>Friends and people you follow</Text>
          {selectedOption === 3 && <Text> ✓ </Text>}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, selectedOption === 4 && styles.selectedOption]}
          onPress={() => handleOptionSelect(4)}>
          <Text style={styles.optionText}>Only Friends</Text>
          {selectedOption === 4 && <Text> ✓ </Text>}
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <View style={styles.toggleItem}>
          <View style={styles.toggleHeaderContainer}>
            <Text style={styles.toggleHeader}>Searchability
            {'\n'}
            </Text>
            <Switch
              value={toggle1}
              onValueChange={toggleSwitch1}
            />
          </View>
          <Text style={styles.toggleDescription}>Make this room searchable</Text>
        </View>
        <View style={styles.toggleItem}>
          <View style={styles.toggleHeaderContainer}>
            <Text style={styles.toggleHeader}>Listeners can add</Text>
            <Switch
              value={toggle2}
              onValueChange={toggleSwitch2}
            />
          </View>
          <Text style={styles.toggleDescription}>Allow everyone to add tracks</Text>
        </View>
        <View style={styles.toggleItem}>
          <View style={styles.toggleHeaderContainer}>
            <Text style={styles.toggleHeader}>Enable chat in room</Text>
            <Switch
              value={toggle3}
              onValueChange={toggleSwitch3}
            />
          </View>
          <Text style={styles.toggleDescription}>Listeners can use chat functionality</Text>
        </View>
        <View style={styles.toggleItem}>
          <View style={styles.toggleHeaderContainer}>
            <Text style={styles.toggleHeader}>Can vote</Text>
            <Switch
              value={toggle4}
              onValueChange={toggleSwitch4}
            />
          </View>
          <Text style={styles.toggleDescription}>Listeners can vote for next song</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={goToEditScreen}>
        <Text style={styles.editButtonText}>Edit Room Details</Text>
      </TouchableOpacity>

      {/* Button to save changes can be added here if needed */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  optionsContainer: {
    marginTop: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedOption: {
    backgroundColor: 'lightblue',
    borderRadius: 5,
    paddingHorizontal: 5,
  },
  optionText: {
    fontSize: 16,
  },
  toggleContainer: {
    marginTop: 20,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  toggleDescription: {
    flex: 1,
    fontSize: 14,
    color: 'grey',
    marginLeft: 10,
  },
  editButton: {
    marginTop: 30,
    backgroundColor: 'blue',
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AdvancedSettings;
