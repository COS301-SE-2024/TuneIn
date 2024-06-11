import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import GenreBubble from './GenreBubble';

const GenreList = ({ items }) => {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>Favorite Genres</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {items.map((item, index) => (
                    <GenreBubble key={index} text={item} />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 20,
    },

    title: {
        fontSize: 20,
        fontWeight: '600',
        paddingBottom: 10,
    },
});

export default GenreList;