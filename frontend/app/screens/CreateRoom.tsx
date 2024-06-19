import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router'; 
import MyToggleWidget from '../components/ToggleWidget'; 

const CreateRoomScreen: React.FC = () => {
  const router = useRouter(); 
  const [isSwitched, setIsSwitched] = useState(false);
  const [roomName, setRoomName] = useState('');

  const screenWidth = Dimensions.get('window').width;

  const handleToggleChange = (isFirstOptionSelected: boolean) => {
    console.log(isFirstOptionSelected ? 'Permanent selected' : 'Temporary selected');
  };
  

  const handleToggleChange2 = (isFirstOptionSelected: boolean) => {
    console.log(isFirstOptionSelected ? 'Public selected' : 'Private selected');
  };

  const navigateToRoomDetails = () => {
    router.navigate("/screens/RoomDetails");
  };


  return (
    <View style={{ flex: 1, backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>×</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Room Option</Text>
        <View style={{ width: 20 }} />
      </View>
      <View style={{ paddingHorizontal: 10, paddingVertical: 20 }}>
        <View style={{ marginBottom: 20 }}>
          <MyToggleWidget
            firstOption="Permanent"
            secondOption="Temporary"
            onChanged={handleToggleChange}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <MyToggleWidget
            firstOption="Public"
            secondOption="Private"
            onChanged={handleToggleChange2}
          />
        </View>
        <View style={{ marginBottom: 20 }}>
          <TextInput
            style={{ borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, padding: 10 }}
            placeholder="Add room name"
            value={roomName}
            onChangeText={setRoomName}
          />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Schedule for later</Text>
          <Switch
            value={isSwitched}
            onValueChange={setIsSwitched}
          />
        </View>
        <TouchableOpacity
          style={{ backgroundColor: '#8B8FA8', borderRadius: 30, height: 50, alignItems: 'center', justifyContent: 'center', elevation: 5 }}
          onPress={navigateToRoomDetails} // Use navigateToRoomDetails function for onPress
        >
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Let's go</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateRoomScreen;
