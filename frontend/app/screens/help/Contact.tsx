// app/help/contact.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ContactSupport() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Contact Support</Text>
      <Text style={styles.item}>Email: support@example.com</Text>
      <Text style={styles.item}>Phone: 123-456-7890</Text>
      <Text style={styles.item}>Working Hours: 9:00 AM - 6:00 PM (Mon - Fri)</Text>
      {/* Add more contact information as needed */}
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
