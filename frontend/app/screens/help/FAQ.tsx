// app/help/faq.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function FAQ() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Frequently Asked Questions</Text>
      <Text style={styles.question}>Q1: How to use this app?</Text>
      <Text style={styles.answer}>A: You can use this app by following these steps...</Text>
      {/* Add more questions and answers as needed */}
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
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
  },
  answer: {
    fontSize: 16,
    marginTop: 5,
  },
});
