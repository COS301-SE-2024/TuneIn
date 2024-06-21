import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Dimensions, ScrollView, Image, Button, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { RoomDetailsProps } from '../models/roomdetails';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AWS from 'aws-sdk';
import Constants from 'expo-constants';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const _AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_NEST_BUCKET_NAME = "tunein-nest-bucket";
const AWS_S3_REGION = process.env.AWS_S3_REGION;
const AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT;


const RoomDetails: React.FC = () => {
  
  const AWS_SECRET_ACCESS_KEY: string = _AWS_SECRET_ACCESS_KEY.replace('+', '+')

  // console.log(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_NEST_BUCKET_NAME, AWS_S3_REGION, AWS_S3_ENDPOINT)
  const router = useRouter();
  const { room } = useLocalSearchParams();
  const newRoom = Array.isArray(room) ? JSON.parse(room[0]) : JSON.parse(room);
  // console.log('room', newRoom);
  AWS.config.update({ 
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    region: AWS_S3_REGION,
  });
  AWS.config.logger = console

// Create an S3 instance
  const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    signatureVersion: 'v4'
  });
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

  const screenWidth = Dimensions.get('window').width;

  const navigateToChatRoom = async () => {
    newRoom['has_nsfw_content'] = roomDetails.isNsfw;
    if(roomDetails.language !== '') {
      newRoom['language'] = roomDetails.language;
    }
    else {
      newRoom['language'] = 'English';
    }
    if(roomDetails.genre !== '')
      newRoom['genre'] = roomDetails.genre;
    else{
      // delete genre field from newRoom
      delete newRoom['genre'];
    }
    if(roomDetails.description !== '')
      newRoom['description'] = roomDetails.description;
    else{
      newRoom['description'] = 'This room has no description.';
    }
    newRoom['has_explicit_content'] = roomDetails.isExplicit;
    newRoom['room_name'] = roomDetails.name;
    var imageURL = '[LINK_HERE]';
    if(newRoom['room_name'] === '' || newRoom['room_name'] === undefined) {
      // alert user to enter room name
      Alert.alert(
        "Room Name Required",
        "Please enter a room name.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    if(image !== null){
      const response = await fetch(image);
      const blob = await response.blob();
      const params = {
        Bucket: AWS_NEST_BUCKET_NAME, // replace with your bucket name
        Key: `${(new Date()).toISOString()}-${roomDetails.name.replace(' ', '-').toLowerCase()}.jpeg`, // replace with the destination key
        Body: blob,
        ContentType: blob.type
      };
      const data = await s3.upload(params)
      .promise()
      console.log('Successfully uploaded image', data.Location);
      imageURL = data.Location;
      setImage(data.Location);
      console.log('image url', image, imageURL, data.Location);
      // s3.upload(params, function(err, data) {
      //   if (err) {
      //     console.log('Error:', err);
      //   } else {
      //     console.log('Successfully uploaded image', data.Location);
      //     setImage(data.Location);
      //     imageURL = data.Location;
      //   }
      // });
    }
    newRoom['image_url'] = imageURL;
    console.log('image url', image);
    console.log('New room:', newRoom, newRoom['room_name'], imageURL);
    console.log('Navigating to ChatRoom screen');
    const token = await AsyncStorage.getItem('token');
    // console.log('Token:', token);
    fetch("http://10.32.253.158:3000/users/rooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` || ""
      },
      body: JSON.stringify(newRoom),
    }).then((response) => response.json())
    .then((data) => {
      // console.log(data);
      router.navigate({
        pathname: '/screens/ChatRoom',
        params: {room: JSON.stringify(data.room)}
      });
    }).catch((error) => {
      console.error("Error:", error);
    });
    // router.navigate("/screens/ChatRoom");
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

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Room Details</Text>
          <View style={{ width: 20 }} />
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
          {_buildInputField('Room Name (required)', roomDetails.name, (value) => handleInputChange('name', value))}
          {_buildInputField('Description', roomDetails.description, (value) => handleInputChange('description', value), 4)}
          {_buildInputField('Genre', roomDetails.genre, (value) => handleInputChange('genre', value))}
          {_buildInputField('Language', roomDetails.language, (value) => handleInputChange('language', value))}
          {_buildInputField('Room Size', roomDetails.roomSize, (value) => handleInputChange('roomSize', value))}
          {_buildToggle('Explicit', roomDetails.isExplicit, (value) => handleInputChange('isExplicit', value))}
          {_buildToggle('NSFW', roomDetails.isNsfw, (value) => handleInputChange('isNsfw', value))}

          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 10 }}>Add a Photo</Text>
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
            onPress={navigateToChatRoom}
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Share</Text>
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

export default RoomDetails;
