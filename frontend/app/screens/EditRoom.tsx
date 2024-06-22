import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Dimensions, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { RoomDetailsProps } from '../models/roomdetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Room } from '../models/Room';

const BASE_URL = 'http://10.32.253.158:3000/'; // Replace with actual backend URL
// Mock function to fetch room details. Replace with actual data fetching logic.

// make the function return value the relavant type

const fetchRoomDetails = async (roomId: string | null) => {
  // Replace with real data fetching
  const token = await AsyncStorage.getItem('token');
  try {
    const data = axios.get(`${BASE_URL}/rooms/${roomId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }});
    console.log(data);
    return data
  } catch (error) {
    console.error('Error:', error);
    return null
  }
};

const EditRoom: React.FC = () => {
  const router = useRouter();
  const _roomID = useLocalSearchParams();
  console.log('Room ID:', _roomID)
  var roomID = '';
  // check if null or undefined. if neither then convert into string from string[]. else, make empty string
  if (_roomID === null || _roomID === undefined) {
    roomID = '3e1ab6e7-afdb-4781-9208-babd32923336';
  }
  const room = Array.isArray(_roomID.room) ? _roomID.room[0] : _roomID.room;
  console.log('Room:', room);
  // const roomID = _roomID ? _roomID.toString() : '';
  const roomStuffs = JSON.parse(room);
  console.log('Room Stuffs:', roomStuffs.roomID);
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
  const [roomId, setRoomId] = useState<string>(''); // Add room ID here
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const loadRoomDetails = async () => {
      const _details = await fetchRoomDetails(roomID);
      console.log('Room details:', _details);
      const details = { // Return default values
        name: 'Sample Room',
        description: 'This is a sample room description.',
        genre: 'Music',
        language: 'English',
        roomSize: '50',
        isExplicit: false,
        isNsfw: false,
        image: 'https://gratisography.com/wp-content/uploads/2024/01/gratisography-cyber-kitty-1170x780.jpg' // Replace with actual image URL
      };
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
