import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	Modal,
	PanResponder,
	Animated,
	Linking,
} from "react-native";

const LinkBottomSheet = ({ isVisible, onClose, links }) => {
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

	// Function to group links by type
	const groupLinksByType = (links) => {
		const groupedLinks = {};
		links.forEach((link) => {
			if (!groupedLinks[link.type]) {
				groupedLinks[link.type] = [];
			}
			groupedLinks[link.type].push(link);
		});
		return groupedLinks;
	};

	// Group links by type
	const groupedLinks = groupLinksByType(links);

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
						{Object.keys(groupedLinks).map((type, index) => (
							<Links
								key={index}
								mediaPlatform={type}
								links={groupedLinks[type]}
							/>
						))}
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
};

const Links = ({ mediaPlatform, links }) => {
	const handleLinkPress = (link) => {
		Linking.openURL("https://www." + link); // Open the link in the device's default browser
	};

	return (
		<View>
			<Text style={styles.mediaHeader}>{mediaPlatform}</Text>
			{links.map((link, index) => (
				<TouchableOpacity
					key={index}
					onPress={() => handleLinkPress(link.links)}
				>
					<Text style={styles.link}>{link.links}</Text>
				</TouchableOpacity>
			))}
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
		paddingBottom: 5,
		fontSize: 18,
		fontWeight: 700,
		textAlign: "left", // Align text to the left
	},
	mediaHeader: {
		paddingBottom: 3,
		paddingTop: 10,
		color: "white",
		fontSize: 14,
		fontWeight: 400,
		textAlign: "left", // Align text to the left
	},
	link: {
		color: "white",
		paddingBottom: 3,
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

export default LinkBottomSheet;
