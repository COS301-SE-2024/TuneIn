import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Import the icon

const AdvancedSettings = () => {
  const router = useRouter();
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
    router.navigate("/screens/EditRoom");
  };

  const goToChat = () => {
    router.navigate("/screens/ChatRoom");
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
          <Text style={styles.toggleHeader}>Searchability</Text>
          <View style={styles.toggleSwitchContainer}>
            <Switch
              value={toggle1}
              onValueChange={toggleSwitch1}
            />
          </View>
          <Text style={styles.toggleDescription}>Make this room searchable</Text>
        </View>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleHeader}>Listeners can add</Text>
          <View style={styles.toggleSwitchContainer}>
            <Switch
              value={toggle2}
              onValueChange={toggleSwitch2}
            />
          </View>
          <Text style={styles.toggleDescription}>Allow everyone to add tracks</Text>
        </View>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleHeader}>Enable chat in room</Text>
          <View style={styles.toggleSwitchContainer}>
            <Switch
              value={toggle3}
              onValueChange={toggleSwitch3}
            />
          </View>
          <Text style={styles.toggleDescription}>Listeners can use chat functionality</Text>
        </View>
        <View style={styles.toggleItem}>
          <Text style={styles.toggleHeader}>Can vote</Text>
          <View style={styles.toggleSwitchContainer}>
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
        <Icon name="edit" size={20} color="black" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.saveButton} onPress={goToChat}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
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
    marginBottom: 20,
  },
  toggleHeader: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleSwitchContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  toggleDescription: {
    fontSize: 14,
    color: 'grey',
    marginTop: 5,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
    marginTop: 20,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginRight: 5,
  },
  saveButton: {
    backgroundColor: '#08BDBD',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AdvancedSettings;
