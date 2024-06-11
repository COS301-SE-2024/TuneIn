import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const SongDialog = ({ visible = false, onClose = () => {}, onSave = () => {}, song = {title: '', artist: '', duration: ''} }) => {
    const [title, setTitle] = useState(song.title);
    const [artist, setArtist] = useState(song.artist);
    const [duration, setDuration] = useState(song.duration);

    useEffect(() => {
        setTitle(song.title);
        setArtist(song.artist);
        setDuration(song.duration);
    }, [song]);

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.dialogContainer}>
                    <Text style={styles.dialogTitle}>Edit Song</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Song Title"
                        value={title}
                        onChangeText={setTitle}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Artist Name"
                        value={artist}
                        onChangeText={setArtist}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Duration"
                        value={duration}
                        onChangeText={setDuration}
                    />
                    <View style={styles.dialogButtons}>
                        <TouchableOpacity onPress={onClose} style={styles.dialogButton}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onSave({title, artist, duration})}
                            style={styles.dialogButton}
                        >
                            <Text>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dialogContainer: {
        width: '80%',
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    dialogTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    dialogButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    dialogButton: {
        marginHorizontal: 10,
        padding: 10,
    },
});

export default SongDialog;

