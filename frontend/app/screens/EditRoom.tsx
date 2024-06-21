import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { Room } from "../models/Room";
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { RoomDetailsProps } from '../models/roomdetails';

// Mock function to fetch room details. Replace with actual data fetching logic.
const fetchRoomDetails = async (roomId) => {
  // Replace with real data fetching
  return {
    name: 'Sample Room',
    description: 'This is a sample room description.',
    genre: 'Music',
    language: 'English',
    roomSize: '50',
    isExplicit: false,
    isNsfw: false,
    image: 'https://gratisography.com/wp-content/uploads/2024/01/gratisography-cyber-kitty-1170x780.jpg' // Replace with actual image URL
  };
};

const EditRoom: React.FC = () => {
  const router = useRouter();
  const [roomDetails, setRoomDetails] = useState<RoomDetailsProps>({
    name: '',
    description: '',
    genre: '',
    language: '',
    roomSize: '50',
    isExplicit: false,
    isNsfw: false
  });

  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const loadRoomDetails = async () => {
      const details = await fetchRoomDetails(/* roomId */);
      setRoomDetails(details);
      setImage(details.image);
    };

    loadRoomDetails();
  }, []);

  const screenWidth = Dimensions.get('window').width;

  const navigateToChatRoom = () => {
    router.navigate("/screens/ChatRoom");
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

  const handleInputChange = (field: keyof RoomDetailsProps, value: string | boolean) => {
    setRoomDetails({ ...roomDetails, [field]: value });
  };

  const saveChanges = () => {
    // Add logic to save changes
    console.log('Changes saved', { ...roomDetails, image });
    navigateToChatRoom();
  };

    return (
        <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.container}>
                <Text style={styles.heading}>Edit Room</Text>
                
                <Text style={styles.label}>Room Name:</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Song Name:</Text>
                <TextInput
                    style={styles.input}
                    value={songName}
                    onChangeText={setSongName}
                />

                <Text style={styles.label}>Artist Name:</Text>
                <TextInput
                    style={styles.input}
                    value={artistName}
                    onChangeText={setArtistName}
                />

                <Text style={styles.label}>Description:</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <Text style={styles.label}>Tags (comma separated):</Text>
                <TextInput
                    style={styles.input}
                    value={tags}
                    onChangeText={setTags}
                />
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Edit Room Details</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
          {_buildInputField('Room Name', roomDetails.name, (value) => handleInputChange('name', value))}
          {_buildInputField('Description', roomDetails.description, (value) => handleInputChange('description', value), 4)}
          {_buildInputField('Genre', roomDetails.genre, (value) => handleInputChange('genre', value))}
          {_buildInputField('Language', roomDetails.language, (value) => handleInputChange('language', value))}
          {_buildInputField('Room Size', roomDetails.roomSize, (value) => handleInputChange('roomSize', value))}
          {_buildToggle('Explicit', roomDetails.isExplicit, (value) => handleInputChange('isExplicit', value))}
          {_buildToggle('NSFW', roomDetails.isNsfw, (value) => handleInputChange('isNsfw', value))}

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 10 }}>Change Photo</Text>
            <TouchableOpacity onPress={pickImage} style={{ marginBottom: 10 }}>
              <View style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text>Select Photo</Text>
              </View>
            </TouchableOpacity>
            {image && <Image source={{ uri: image }} style={{ width: screenWidth - 60, height: 200, borderRadius: 10 }} />}
          </View>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>

                {/* Edit Playlist Button */}
                <TouchableOpacity
                    style={styles.editPlaylistButton}
                    onPress={handleEditPlaylists}
                >
                    <Text style={styles.editPlaylistButtonText}>Edit Playlist</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
          <TouchableOpacity
            style={{
              backgroundColor: '#8B8FA8',
              borderRadius: 30,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 5,
              marginTop: 10
            }}
            onPress={saveChanges}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 1,
        backgroundColor: "#ffffff",
    },
    container: {
        padding: 20,
        flex: 1,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 20,
    },
    label: {
        color: "#333333",
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#eeeeee",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 16,
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: "top", // For Android
    },
    saveButton: {
        backgroundColor: "#1E90FF",
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 20,
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    editPlaylistButton: {
        backgroundColor: "#4CAF50",
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 10,
    },
    editPlaylistButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});

const _buildInputField = (labelText: string, value: string, onChange: (value: string) => void, maxLines = 1) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 10 }}>{labelText}</Text>
      <TextInput
        style={{
          borderWidth: 1,
          borderColor: '#D1D5DB',
          borderRadius: 10,
          padding: 10,
          backgroundColor: '#F9FAFB'
        }}
        placeholder={`Add ${labelText.toLowerCase()}`}
        value={value}
        onChangeText={onChange}
        multiline={maxLines > 1}
        numberOfLines={maxLines}
      />
    </View>
  );
};

const _buildToggle = (labelText: string, value: boolean, onChange: (value: boolean) => void) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{labelText}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
      />
    </View>
  );
};

export default EditRoom;
