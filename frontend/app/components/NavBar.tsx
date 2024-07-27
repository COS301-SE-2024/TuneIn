import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors } from "../styles/colors";

const NavBar: React.FC = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<string>("Home");

	const navigate = (route: string, tab: string) => {
		setActiveTab(tab);
		router.navigate(route);
	};

	return (
		<View style={styles.container}>
			<View style={styles.topLine}></View>
			<TouchableOpacity onPress={() => navigate("/screens/Home", "Home")}>
				<View style={styles.tabItem}>
					<Ionicons
						name={activeTab === "Home" ? "home-sharp" : "home-outline"}
						size={24}
						color={activeTab === "Home" ? colors.primary : "#333"}
					/>
					<Text
						style={[styles.text, activeTab === "Home" && styles.activeText]}
					>
						Home
					</Text>
				</View>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => navigate("/screens/site", "Sitemap")}>
				<View style={styles.tabItem}>
					<Ionicons
						name={activeTab === "Sitemap" ? "map-sharp" : "map-outline"}
						size={24}
						color={activeTab === "Sitemap" ? colors.primary : "#333"}
					/>
					<Text
						style={[styles.text, activeTab === "Sitemap" && styles.activeText]}
					>
						Sitemap
					</Text>
				</View>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => navigate("/screens/Search", "Search")}>
				<View style={styles.tabItem}>
					<Ionicons
						name={activeTab === "Search" ? "search-sharp" : "search-outline"}
						size={24}
						color={activeTab === "Search" ? colors.primary : "#333"}
					/>
					<Text
						style={[styles.text, activeTab === "Search" && styles.activeText]}
					>
						Search
					</Text>
				</View>
			</TouchableOpacity>
			<TouchableOpacity
				onPress={() => navigate("/screens/help/HelpScreen", "Help")}
			>
				<View style={styles.tabItem}>
					<Ionicons
						name={
							activeTab === "Help" ? "help-circle-sharp" : "help-circle-outline"
						}
						size={24}
						color={activeTab === "Help" ? colors.primary : "#333"}
					/>
					<Text
						style={[styles.text, activeTab === "Help" && styles.activeText]}
					>
						Help
					</Text>
				</View>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		backgroundColor: "#FFF",
		borderTopWidth: 1, // Grey line at the top
		borderTopColor: "#E5E5E5", // Grey color
		paddingTop: 8, // Add padding to the top
		paddingBottom: 8, // Add padding to the bottom
		elevation: 4, // Elevation for Android shadow
	},
	topLine: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 1,
		backgroundColor: "#E5E5E5", // Grey line color
	},
	tabItem: {
		alignItems: "center",
	},
	text: {
		color: "#333",
		fontSize: 14,
		marginTop: 4,
	},
	activeText: {
		color: colors.primary,
		fontWeight: "bold", // Bold text for active tab
	},
});

export default NavBar;
