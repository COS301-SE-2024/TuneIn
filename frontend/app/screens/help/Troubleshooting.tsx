// app/help/troubleshooting.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Troubleshooting() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Troubleshooting</Text>
      <Text style={styles.item}>- Issue 1: Solution 1...</Text>
      <Text style={styles.item}>- Issue 2: Solution 2...</Text>
      {/* Add more troubleshooting items as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  item: {
    fontSize: 16,
    marginTop: 10,
  },
});
