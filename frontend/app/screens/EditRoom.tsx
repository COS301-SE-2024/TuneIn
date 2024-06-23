import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Dimensions, ScrollView, Image, StyleSheet } from 'react-native';
import {useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Room } from '../models/Room';

const BASE_URL = 'http://localhost:3000/'; // Replace with actual backend URL
// Mock function to fetch room details. Replace with actual data fetching logic.
const fetchRoomDetails = async (roomId: string): Promise<Room> => {
  // Replace with real data fetching
  return {
    id: roomId,
    name: 'Sample Room',
    description: 'This is a sample room description.',
    backgroundImage: 'https://gratisography.com/wp-content/uploads/2024/01/gratisography-cyber-kitty-1170x780.jpg',
    tags: [],
    roomSize: 50,
    isExplicit: false,
    isNsfw: false,
  };
};

const EditRoom: React.FC = () => {
  const router = useRouter();
  const { room } = useLocalSearchParams();
  const roomData = JSON.parse(room);
  const [roomDetails, setRoomDetails] = useState<Room>({
    id: roomData,
    name: roomData,
    description: roomData,
    backgroundImage: '',
    tags: [],
    roomSize: 50,
    isExplicit: false,
    isNsfw: false,
  });

  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const loadRoomDetails = async () => {
      const details = await fetchRoomDetails("demo");
      setRoomDetails(details);
      setImage(details.backgroundImage);
    };

    loadRoomDetails();
  }, []);

  const screenWidth = Dimensions.get('window').width;

  const navigateToChatRoom = () => {
    router.navigate("/screens/ChatRoom");
  };

  const navigateToEditPlaylist = () => {
    router.navigate("/screens/rooms/EditPlaylist");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleInputChange = (field: keyof Room, value: string | boolean) => {
    if (field === 'roomSize') {
      setRoomDetails({ ...roomDetails, [field]: Number(value) });
    } else {
      setRoomDetails({ ...roomDetails, [field]: value });
    }
  };

  const saveChanges = () => {
    // Add logic to save changes
    console.log('Changes saved', { ...roomDetails, backgroundImage: image });
    navigateToChatRoom();
  };



  return (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Room Details</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.form}>
          {buildInputField('Room Name', roomDetails.name, (value) => handleInputChange('name', value))}
          {buildInputField('Description', roomDetails.description, (value) => handleInputChange('description', value), 4)}
          {buildInputField('Genre', roomDetails.genre, (value) => handleInputChange('genre', value))}
          {buildInputField('Language', roomDetails.language, (value) => handleInputChange('language', value))}
          {buildInputField('Room Size', roomDetails.roomSize.toString(), (value) => handleInputChange('roomSize', value))}
          {buildToggle('Explicit', roomDetails.isExplicit, (value) => handleInputChange('isExplicit', value))}
          {buildToggle('NSFW', roomDetails.isNsfw, (value) => handleInputChange('isNsfw', value))}

          <View style={styles.imagePickerContainer}>
            <Text style={styles.imagePickerLabel}>Change Photo</Text>
            <TouchableOpacity onPress={pickImage} style={styles.imagePickerButton}>
              <View style={styles.imagePickerButtonContent}>
                <Text>Select Photo</Text>
              </View>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={[styles.imagePreview, { width: screenWidth - 60 }]} />}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={navigateToEditPlaylist}>
            <Text style={styles.saveButtonText}>Edit Playlist</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const buildInputField = (labelText: string, value: string, onChange: (value: string) => void, maxLines = 1) => {
  return (
    <View style={styles.inputFieldContainer}>
      <Text style={styles.inputFieldLabel}>{labelText}</Text>
      <TextInput
        style={styles.inputField}
        placeholder={`Add ${labelText.toLowerCase()}`}
        value={value}
        onChangeText={onChange}
        multiline={maxLines > 1}
        numberOfLines={maxLines}
      />
    </View>
  );
};

const buildToggle = (labelText: string, value: boolean, onChange: (value: boolean) => void) => {
  return (
    <View style={styles.toggleContainer}>
      <Text style={styles.toggleLabel}>{labelText}</Text>
      <Switch value={value} onValueChange={onChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  closeButton: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerPlaceholder: {
    width: 20,
  },
  form: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  inputFieldContainer: {
    marginBottom: 20,
  },
  inputFieldLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  imagePickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingBottom: 10,
  },
  imagePickerButton: {
    marginBottom: 10,
  },
  imagePickerButtonContent: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  imagePreview: {
    height: 200,
    borderRadius: 10,
  },
  saveButton: {
    backgroundColor: '#8B8FA8',
    borderRadius: 30,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    marginTop: 10,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default EditRoom;
