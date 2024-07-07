import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useApi } from "../api/APIContext";

const ApiTest: React.FC = () => {
	const api = useApi();
	const [data, setData] = useState<any>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				console.log("Starting API call"); // Debugging log
				const response = await api.appControllerGetHello(); // Adjust method call based on your API
				console.log("API call response:", response); // Debugging log
				setData(response);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, [api]);

	return (
		<View style={styles.container}>
			<Text>Home Screen</Text>
			{data ? (
				<Text>Data: {JSON.stringify(data)}</Text>
			) : (
				<Text>Loading...</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default ApiTest;
