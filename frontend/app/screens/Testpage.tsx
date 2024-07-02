import React, { useState } from "react";
import { View, Button, StyleSheet } from "react-native";
import DevicePicker from "./DevicePicker"; // Replace with the correct path

const DevicePickerTest = () => {
  const [showDevicePicker, setShowDevicePicker] = useState(false);

  const handlePress = () => {
    setShowDevicePicker(!showDevicePicker);
  };

  return (
    <View style={styles.container}>
      <Button title="Test Device Picker" onPress={handlePress} />
      {showDevicePicker && <DevicePicker />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});

export default DevicePickerTest;
