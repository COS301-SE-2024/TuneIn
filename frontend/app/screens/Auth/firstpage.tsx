import React from "react";
import { View, Button } from "react-native";
import { openBrowserAsync } from "expo-web-browser";

const FirstPage = () => {
	const openSecondPage = async () => {
		const url = "https://example.com/second-page?data=initial_data"; // Replace with your actual second page URL and initial data
		await openBrowserAsync(url);
	};

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Button title="Open Second Page" onPress={openSecondPage} />
		</View>
	);
};

export default FirstPage;
