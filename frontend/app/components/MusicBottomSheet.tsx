import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Image,
	Text,
	TouchableOpacity,
	StyleSheet,
	Modal,
	PanResponder,
	Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const MusicBottomSheet = ({ isVisible, onClose}) => {
    const spotifyImg = "../assets/spotify.png";
    const ytMusicImg = "../assets/ytMusic.png"
	const animation = useRef(new Animated.Value(50)).current; // Adjust initial translateY here
	const [visible, setVisible] = useState(isVisible); // State to manage visibility

	useEffect(() => {
        setVisible(isVisible); // Update visibility state when prop changes
    }, [isVisible]);

	const handleOnClose = () => {
		setVisible(false); // Set visibility to false
		onClose();
	};
	const [panResponder] = useState(
		PanResponder.create({
			onStartShouldSetPanResponder: () => true,
			onMoveShouldSetPanResponder: () => true,
			onPanResponderMove: Animated.event([null, { dy: animation }], {
				useNativeDriver: false,
				listener: (evt, gestureState) => {
					if (gestureState.dy > 0) {
						// Allow dragging only downwards
						if (gestureState.dy < 300) {
							// limit the maximum peeking height
							animation.setValue(gestureState.dy);
						}
					}
				},
			}),
			onPanResponderRelease: (evt, gestureState) => {
				if (gestureState.dy > 20) {
					handleOnClose();
				} else {
					Animated.spring(animation, {
						toValue: 0,
						useNativeDriver: false,
					}).start();
				}
			},
		}),
	);

	return (
		<Modal
			transparent={true}
			animationType="slide"
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.modalContainer}>
				<Animated.View
					style={[styles.modal, { transform: [{ translateY: animation }] }]}
				>
					<View style={styles.dragHandle} {...panResponder.panHandlers} />
					<View style={styles.textContainer}>
						<MusicPlatform title={"Spotify"} link="" onPress={() => {}} image={require("../assets/spotify.png")} />
						<MusicPlatform title={"YouTube Music"} link="" onPress={() => {}} image={require("../assets/ytMusic.png")} />
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
};

const Links = ({ mediaPlatform, link }) => {
	return (
		<View>
			<Text style={styles.mediaHeader}>{mediaPlatform}</Text>
		</View>
	);
};

const MusicPlatform = ({ title, link = "", onPress, image="" }) => {
	return (
		<TouchableOpacity>
			<View style={styles.platformContainer}>
				<Image
					source={image}
					style={styles.platformArt}
				/>
				<View style={styles.spacer}>
					<Text style={styles.platformName}>{title}</Text>
				</View>
				<MaterialIcons name="chevron-right" size={24} color="black" />
			</View>
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	modal: {
		backgroundColor: "white",
		padding: 20,
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		alignItems: "center",
		width: "100%",
		minHeight: "30%", // Adjust the minimum height here
	},
	textContainer: {
		alignSelf: "flex-start",
        paddingTop: 10,
		marginLeft: 20,
		marginBottom: 10,
	},
	modalTitle: {
		color: "white",
		paddingBottom: 20,
		fontSize: 18,
		fontWeight: 700,
		textAlign: "left", // Align text to the left
	},
	mediaHeader: {
		paddingBottom: 3,
		color: "white",
		fontSize: 14,
		fontWeight: 400,
		textAlign: "left", // Align text to the left
	},
	link: {
		color: "white",
		paddingBottom: 20,
		fontSize: 12,
		fontWeight: 400,
		textAlign: "left", // Align text to the left
	},
	dragHandle: {
		width: 60,
		height: 5,
		backgroundColor: "#ccc",
		borderRadius: 5,
		marginBottom: 10,
	},

    //Music Platform Styling
	platformName: {
		fontSize: 16,
		fontWeight: "700",
	},    
	platformContainer: {
        width: 330,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        paddingBottom: 10,
      },
	platformArt: {
		width: 57,
		height: 57,
		borderRadius: 12,
		backgroundColor: "rgba(158, 171, 184, 1)",
		marginRight: 16,
	},
	spacer: {
        flex: 1,
      },
      
	icon: {
		marginLeft: 30,
	},
});

export default MusicBottomSheet;
