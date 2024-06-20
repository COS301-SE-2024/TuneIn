import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useRouter } from 'expo-router'; 
import MyToggleWidget from '../components/ToggleWidget'; 

const CreateRoomScreen: React.FC = () => {
  const router = useRouter(); 
  const [isSwitched, setIsSwitched] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [newRoom, setNewRoom] = useState({
    room_name: '',
    is_permanent: true,
    is_private: false,
  });

  const screenWidth = Dimensions.get('window').width;

  const handleToggleChange = (isFirstOptionSelected: boolean) => {
    newRoom['is_permanent'] = isFirstOptionSelected;
    console.log(isFirstOptionSelected ? 'Permanent selected' : 'Temporary selected', newRoom);
  };
  

  const handleToggleChange2 = (isFirstOptionSelected: boolean) => {
    newRoom['is_private'] = !isFirstOptionSelected;
    console.log(isFirstOptionSelected ? 'Public selected' : 'Private selected', newRoom);
  };

  const navigateToRoomDetails = () => {
    console.log('Navigating to RoomDetails screen');
    if (roomName === '') {
      Alert.alert(
        "Invalid Room Name",
        "Please enter a room name.",
        [{ text: "OK" }],
        { cancelable: false }
      );
      return;
    }
    const room = JSON.stringify(newRoom);
    router.navigate({
      pathname: '/screens/RoomDetails',
      params: {room: room},
    });
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
            onChangeText={(text) => {
              newRoom['room_name'] = text;
              setRoomName(text);
              console.log('Room name:', text, newRoom)
            }}
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
