import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";

interface HorizontalBarGraphCardProps {
	data: { label: string; value: number }[]; // Data for the horizontal bar chart
	title: string; // Header title
	unit?: "number" | "minutes"; // Optional unit prop
}

const HorizontalBarGraphCard: React.FC<HorizontalBarGraphCardProps> = ({
	data,
	title,
	unit = "number", // Default to "number" if unit is not provided
}) => {
	// Calculate the total value
	const totalValue = data.reduce((acc, item) => acc + item.value, 0);

	// Format the total based on the unit
	const formatTotal = () => {
		if (unit === "minutes") {
			const hours = Math.floor(totalValue / 60);
			const minutes = totalValue % 60;
			return `${hours}h ${minutes}m`;
		}
		return totalValue.toString();
	};

	return (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>{title}</Text>
			<Text style={styles.subheader}>{formatTotal()}</Text>
			<BarChart
				data={{
					labels: data.map((item) => item.label),
					datasets: [
						{
							data: data.map((item) => item.value),
						},
					],
				}}
				width={Dimensions.get("window").width - 40} // From StyleSheet
				height={220}
				chartConfig={{
					backgroundColor: "#fff",
					backgroundGradientFrom: "#fff",
					backgroundGradientTo: "#fff",
					decimalPlaces: 2,
					color: (opacity = 1) => `rgba(8, 189, 189, ${opacity})`, // Primary color for the bars
					style: {
						borderRadius: 16,
					},
					propsForLabels: {
						fontFamily: "System", // Use system font for labels
						fontSize: 12,
						color: "#000", // Set label color to black
					},
				}}
				// horizontal={true} // Uncomment to make the bar chart horizontal
				style={styles.chart}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 8,
		paddingTop: 20,
		paddingBottom: 10,
		marginVertical: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: "500",
		marginBottom: 5,
		marginLeft: 10,
	},
	subheader: {
		fontSize: 28,
		marginBottom: 15,
		marginLeft: 10,
		color: "#ff",
		fontWeight: "bold",
	},
	chart: {
		borderRadius: 16,
	},
});

export default HorizontalBarGraphCard;
