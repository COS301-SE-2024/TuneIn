import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import { colors } from "../styles/colors";

interface MetricsCardProps {
	title: string;
	number: string;
	percentage?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
	title,
	number,
	percentage,
}) => {
	const isPositive = !percentage?.startsWith("-");
	return (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>{title}</Text>
			<Text style={styles.cardNumber}>{number}</Text>
			{percentage && (
				<View style={styles.percentageContainer}>
					<Text
						style={[
							styles.cardPercentage,
							isPositive ? styles.positive : styles.negative,
						]}
					>
						{percentage + "%"}
					</Text>
					<AntDesign
						name={isPositive ? "arrowup" : "arrowdown"}
						size={16}
						color={isPositive ? "green" : "red"}
					/>
				</View>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		flex: 1,
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		marginHorizontal: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	cardTitle: {
		fontSize: 17,
		color: "black",
		fontWeight: "500",
	},
	cardNumber: {
		fontSize: 30,
		color: "black",
		fontWeight: "bold",
		marginTop: 10,
	},
	percentageContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 10,
	},
	cardPercentage: {
		fontSize: 16,
		color: colors.secondary,
		fontWeight: "bold",
		marginLeft: 5,
	},
	positive: {
		color: colors.secondary,
	},
	negative: {
		color: colors.secondary,
	},
});

export default MetricsCard;
