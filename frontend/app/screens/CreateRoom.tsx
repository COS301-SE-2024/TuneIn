import React, { useState } from 'react';
import { View, Text, TextInput, Switch, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router'; // Import useRouter from 'expo-router'
import MyToggleWidget from '../components/ToggleWidget'; // Adjust the import path as needed
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';

const CreateRoomScreen: React.FC = () => {
  const router = useRouter(); 
  const [isSwitched, setIsSwitched] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleToggleChange = (isFirstOptionSelected: boolean) => {
    console.log(isFirstOptionSelected ? 'Permanent selected' : 'Temporary selected');
  };

  const handleToggleChange2 = (isFirstOptionSelected: boolean) => {
    console.log(isFirstOptionSelected ? 'Public selected' : 'Private selected');
  };

  const navigateToRoomDetails = () => {
    router.navigate("/screens/RoomDetails");
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || time;
    setShowTimePicker(Platform.OS === 'ios');
    setTime(currentTime);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 10 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontSize: 20, fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Room Option</Text>
            <View style={{ width: 20 }} />
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 20, flexGrow: 1 }}>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Schedule for later</Text>
              <Switch
                value={isSwitched}
                onValueChange={setIsSwitched}
              />
            </View>
            {isSwitched && (
              <View style={{ marginBottom: 20 }}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginBottom: 20 }}>
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#70c6d8',
                      borderRadius: 10,
                      padding: 10,
                      backgroundColor: '#F9FAFB',
                    }}
                    placeholder="Select Day"
                    value={moment(date).format('MM/DD/YYYY')}
                    editable={false}
                  />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                  />
                )}
                <TouchableOpacity onPress={() => setShowTimePicker(true)} >
                  <TextInput
                    style={{
                      borderWidth: 1,
                      borderColor: '#70c6d8',
                      borderRadius: 10,
                      padding: 10,
                      backgroundColor: '#F9FAFB'
                    }}
                    placeholder="Select Time"
                    value={moment(time).format('HH:mm')}
                    editable={false}
                  />
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            )}
          </View>
          <TouchableOpacity
            style={{
              backgroundColor: '#8B8FA8',
              borderRadius: 30,
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 5,
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
            }}
            onPress={navigateToRoomDetails} // Use navigateToRoomDetails function for onPress
          >
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'white' }}>Let's go</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateRoomScreen;
