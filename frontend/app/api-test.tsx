import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Configuration, DefaultApi } from "../api";
//import { Configuration, DefaultApi } from "../api-client";
import * as utils from "./services/Utils";

const ApiTest: React.FC = () => {
	const config = new Configuration({ basePath: utils.API_BASE_URL });
	const apiService = new DefaultApi(config);
	console.log("API service:", apiService);
	apiService.appControllerGetHello().then((response) => {
		console.log("API service response:", response);
	});

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
