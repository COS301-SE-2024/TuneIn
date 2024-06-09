import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const CommentWidget = ({ username, message, profilePictureUrl }) => {
    return (
        <View style={styles.container}>
            <View style={styles.profileContainer}>
                <Image
                    source={{ uri: profilePictureUrl }}
                    style={styles.profileImage}
                />
            </View>
            <View style={styles.commentContainer}>
                <Text style={styles.username}>{username}</Text>
                <View style={styles.messageBubble}>
                    <Text style={[styles.messageText, { width: '100%' }]}>{message}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align items at the start
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    profileContainer: {
        marginTop: 25, // Move profile picture down to be inline with message bubble
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#8B8FA8', // Profile circle color
    },
    commentContainer: {
        marginLeft: 10,
        flex: 1,
    },
    username: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4, // Add space between username and message
    },
    messageBubble: {
        padding: 10,
        backgroundColor: 'white',
        borderRadius: 24, // Curved edges
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        width: 'auto', // Adjust width based on text length
    },
    messageText: {
        fontSize: 16,
    },
});

export default CommentWidget;
