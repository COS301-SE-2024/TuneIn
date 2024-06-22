// app/help/ProfileManagement.js
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function ProfileManagement() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Profile Management</Text>

      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Creating and Updating Your Profile</Text>
          <Text style={styles.cardText}>Showcase your musical preferences, recently visited rooms, bookmarked rooms and  unique taste profile by creating or updating your profile for other users to see your music taste.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Music Preferences</Text>
          <Text style={styles.cardText}>Import or manually specify your favorite artists, genres, and songs.</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Personalized Recommendations</Text>
          <Text style={styles.cardText}>Receive personalized room recommendations to enhance discovery and connection through shared tastes.</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3, // for Android
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  cardText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 22,
  },
});
