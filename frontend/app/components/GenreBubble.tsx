import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const GenreBubble = ({ text }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>{text}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    text: {
        color: 'black',
        fontWeight: '500',
        fontSize: 14,
    },
    container: {
        marginRight: 12,
        paddingHorizontal: 14,
        paddingVertical: 8,
        backgroundColor: 'rgba(232, 235, 242, 1)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default GenreBubble;