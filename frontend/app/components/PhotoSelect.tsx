import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, Modal, TouchableOpacity, Button } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker"; // Import Expo's image picker library

const PhotoSelect = ({ isVisible, onClose, onImageUpload }) => {
	const [image, setImage] = useState(null);
    const [visibility, setVisibility] = useState(isVisible)

    useEffect(() => {
        setVisibility(isVisible);
    }, [isVisible]);

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result["uri"]);
			onImageUpload(result["uri"]);		}
	};

	return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visibility}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modal}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Add Image</Text>
                    {image && (
                        <View style={styles.imageContainer}>
                            <Image source={{ uri: image }} style={styles.image} />
                        </View>
                    )}
                    <Button title="Choose from Library" onPress={pickImage} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    imageContainer: {
        
        marginVertical: 10,
        alignItems: "center",
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: "contain",
    },
    chooseButton: {
        marginTop: 20,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
});

export default PhotoSelect;
