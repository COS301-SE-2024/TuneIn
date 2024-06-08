import React, { useState, useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Modal,
	PanResponder,
	Animated,
} from "react-native";

const BottomSheet = ({ isVisible, onClose }) => {
	const animation = useRef(new Animated.Value(50)).current; // Adjust initial translateY here
	const [visible, setVisible] = useState(isVisible); // State to manage visibility

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
				if (gestureState.dy > 50) {
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
						<Text style={styles.modalTitle}>Links</Text>
						<Links mediaPlatform={"Instagram"} link={"instagram.com/john"} />
						<Links mediaPlatform={"Twitter"} link={"twitter.com/john"} />
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
			<Text style={styles.link}>{link}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	modalContainer: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0)",
		justifyContent: "flex-end",
	},
	modal: {
		backgroundColor: "rgba(158, 171, 184, 1)",
		padding: 20,
		borderTopLeftRadius: 40,
		borderTopRightRadius: 40,
		alignItems: "center",
		width: "100%",
		minHeight: "30%", // Adjust the minimum height here
	},
	textContainer: {
		alignSelf: "flex-start",
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
});

export default BottomSheet;
