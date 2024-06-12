import React, { useState, useEffect } from "react";
import {
	View,
	Text,
	Image,
	StyleSheet,
	Modal,
	TouchableOpacity,
	Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker"; // Import Expo's image picker library

const PhotoSelect = ({ isVisible, onClose, onImageUpload }) => {
	const [image, setImage] = useState(null);
	const [visibility, setVisibility] = useState(isVisible);

	useEffect(() => {
		setVisibility(isVisible);
	}, [isVisible]);

	const pickImage = async () => {
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.All,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
		});

		if (!result.canceled) {
			setImage(result["uri"]);
			onImageUpload(result["uri"]);
		}
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
                    <View style={styles.headerContainer}>
                        
                        <Text style={styles.modalTitle}>Add Image</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="black" />
                        </TouchableOpacity>
                    </View>
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
}
    
    const styles = StyleSheet.create({
        modalContainer: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
        },
        modal: {
            backgroundColor: "white",
            paddingHorizontal: 10,
            paddingBottom: 12,
            borderRadius: 10,
            alignItems: "center",
            height: 110,
        },
        headerContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 20,
            width: '100%',
        },
        closeButton: {
            paddingVertical: 5,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 'auto',
            marginRight: 'auto',
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
    });
    
    export default PhotoSelect;
    
    