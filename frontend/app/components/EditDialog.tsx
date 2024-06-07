import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const EditDialog = ({ initialText = '', visible = false, onClose = () => {}, onSave = () => {}, value = '' }) => {
    const [text, setText] = useState(initialText);

    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.dialogContainer}>
                    <Text style={styles.dialogTitle}>Edit</Text>
                    <TextInput
                        style={styles.input}
                        multiline={true}
                        numberOfLines={3}
                        value={text}
                        onChangeText={setText}
                    />
                    <View style={styles.dialogButtons}>
                        <TouchableOpacity onPress={onClose} style={styles.dialogButton}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => onSave(text, value)}
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
        height: 100,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        textAlignVertical: 'top',
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

export default EditDialog;

