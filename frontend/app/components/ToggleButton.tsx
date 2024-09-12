import React, { useState, useRef, useEffect } from "react";
import { Text, TouchableOpacity, StyleSheet, TextInput } from "react-native";

type ToggleButtonProps = {
	label: string;
	testID?: string;
	value: string;
	onValueChange: (value: string) => void;
};

const ToggleButton: React.FC<ToggleButtonProps> = ({
	label,
	testID,
	value,
	onValueChange,
}) => {
	const [isSelected, setIsSelected] = useState(false);
	const [text, setText] = useState(value);
	const inputRef = useRef<TextInput>(null);

	const handleClick = () => {
		setIsSelected(!isSelected);
	};

	const changeText = (val: any) => {
		setText(val);
		onValueChange(val);
	};

	useEffect(() => {
		if (isSelected && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isSelected]);

	return (
		<TouchableOpacity
			onPress={handleClick}
			style={[
				styles.toggleButton,
				isSelected ? styles.selected : styles.notSelected,
			]}
			testID={testID}
		>
			{isSelected ? (
				<TextInput
					ref={inputRef}
					style={styles.input}
					value={text}
					onChangeText={changeText}
					placeholder={`Enter ${label}`}
					placeholderTextColor="#fff"
					testID={`${label} input`}
				/>
			) : (
				<Text style={styles.label}>{label}</Text>
			)}
		</TouchableOpacity>
	);
};

const styles = StyleSheet.create({
	toggleButton: {
		padding: 10,
		borderRadius: 7,
		marginBottom: 10,
		marginRight: 10,
		flex: 1,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		width: 120,
	},
	selected: {
		backgroundColor: "#08bdbd",
	},
	notSelected: {
		backgroundColor: "#8b8fa8",
	},
	label: {
		color: "#fff",
		fontWeight: "bold",
		textAlign: "center",
	},
	input: {
		color: "#fff",
		fontWeight: "bold",
		textAlign: "center",
		width: "100%",
	},
});

export default ToggleButton;
