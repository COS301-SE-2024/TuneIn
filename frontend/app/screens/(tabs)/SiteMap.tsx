// app/SiteMap.tsx
import React from "react";
import { View, Text, Button } from "react-native";
import { useRouter } from "expo-router"; // Import the useRouter hook

const SiteMap = () => {
	const router = useRouter();

	const navigateToNonExistentPage = () => {
		router.push("/non-existent-page"); // Attempt to navigate to a non-existent route
	};

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Site Map Screen</Text>
			<Button
				title="Go to Non-Existent Page"
				onPress={navigateToNonExistentPage}
			/>
		</View>
	);
};

export default SiteMap;
