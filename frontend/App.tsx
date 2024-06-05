// App.tsx
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import Home from './src/screens/Home'; // Adjust the path as needed


const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Home />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
