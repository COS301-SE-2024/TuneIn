import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditGenreBubble = ({ text, onPress }) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <Text style={styles.text}>{text}</Text>
            <Ionicons name="close" size={16} color="black" style={styles.icon} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
        marginBottom: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        backgroundColor: 'rgba(232, 235, 242, 1)',
        borderRadius: 10,
    },
    text: {
        color: 'black',
        fontWeight: '500',
        fontSize: 14,
    },
    icon: {
        marginLeft: 3,
    },
});

export default EditGenreBubble;

