import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Configuration, DefaultApi } from "../api"; // or "../api-client"
import * as utils from "./services/Utils";

// Define types for the response if needed
interface ApiResponse {
	// Define properties based on the expected API response
	message?: string;
}

const ApiTest: React.FC = () => {
	const [data, setData] = useState<ApiResponse | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const config = new Configuration({ basePath: utils.API_BASE_URL });
				const apiService = new DefaultApi(config);

				// Assuming the method is correct, otherwise update to match the actual method name
				const response = await apiService.appControllerGetHello();
				console.log("API service response:", response);

				setData(response); // Set the response data to state
			} catch (error) {
				console.error("Failed to fetch data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	return (
		<View style={styles.container}>
			<Text>Home Screen</Text>
			{loading ? (
				<Text>Loading...</Text>
			) : data ? (
				<Text>Data: {JSON.stringify(data)}</Text>
			) : (
				<Text>No data available</Text>
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
