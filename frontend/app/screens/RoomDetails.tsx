import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Dimensions } from 'react-native';
import { Link, useRouter } from 'expo-router'; // Import Link and useRouter from 'expo-router'

const RoomDetaills: React.FC = () => {
  const router = useRouter(); // Use useRouter instead of useNavigation
  const [isNsfw, setIsNsfw] = useState(false);
  const [isExplicit, setIsExplicit] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');

  const screenWidth = Dimensions.get('window').width;

  const navigateToChatRoom = () => {
    router.navigate("/screens/ChatRoom");
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>×</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Room Details</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
        {_buildInputField('Name', name, setName)}
        {_buildInputField('Description', description, setDescription, 4)}
        {_buildInputField('Genre', genre, setGenre)}
        {_buildInputField('Language', language, setLanguage)}
        {_buildToggle('Explicit', isExplicit, setIsExplicit)}
        {_buildToggle('NSFW', isNsfw, setIsNsfw)}
        <TouchableOpacity
          style={{ backgroundColor: '#8B8FA8', borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center', elevation: 5, marginTop: 10 }}
          onPress={navigateToChatRoom}
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const _buildInputField = (labelText: string, value: string, setValue: React.Dispatch<React.SetStateAction<string>>, maxLines = 1) => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', paddingBottom: 10 }}>{labelText}</Text>
      <TextInput
        style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 10 }}
        placeholder={`Add ${labelText.toLowerCase()}`}
        value={value}
        onChangeText={(text) => setValue(text)}
        multiline={maxLines > 1}
        numberOfLines={maxLines}
      />
    </View>
  );
};

const _buildToggle = (labelText: string, value: boolean, setValue: React.Dispatch<React.SetStateAction<boolean>>) => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{labelText}</Text>
      <Switch
        value={value}
        onValueChange={(val) => setValue(val)}
      />
    </View>
  );
};

export default RoomDetaills;
