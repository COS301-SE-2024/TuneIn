import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RoomeInfo = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.pageName}>Page RoomeInfo</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default RoomeInfo;
