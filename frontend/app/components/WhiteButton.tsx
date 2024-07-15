// WhiteButton.tsx
import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface WhiteButtonProps {
  title: string;
  onPress: () => void;
}

const WhiteButton: React.FC<WhiteButtonProps> = ({ title, onPress}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "92%",
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderColor: "#E8ECF4",
    borderWidth: 1,
    borderRadius: 56,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
});

export default WhiteButton;
