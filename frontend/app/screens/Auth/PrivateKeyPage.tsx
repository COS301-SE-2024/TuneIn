import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView } from "react-native";
import * as SecureStore from "expo-secure-store";
import forge from "node-forge";
import { colors } from "../../styles/colors";

const PrivateKeyScreen = () => {
	const [privateKey, setPrivateKey] = useState("");
	const [publicKey, setPublicKey] = useState("");
	const [isConfirmed, setIsConfirmed] = useState(false);

	// Generate RSA key pair on mount
	useEffect(() => {
		generateKeyPair();
	}, []);

	const generateKeyPair = () => {
		const { pki } = forge;
		const keypair = pki.rsa.generateKeyPair(2048);
		const privateKeyPem = pki.privateKeyToPem(keypair.privateKey);
		const publicKeyPem = pki.publicKeyToPem(keypair.publicKey);

		setPrivateKey(privateKeyPem);
		setPublicKey(publicKeyPem);
	};

	const handleConfirm = async () => {
		try {
			await SecureStore.setItemAsync("privateKey", privateKey);
			setIsConfirmed(true);
		} catch (error) {
			console.error("Error storing private key:", error);
		}
	};

	return (
		<ScrollView
			contentContainerStyle={[
				styles.container,
				{ backgroundColor: colors.backgroundColor },
			]}
		>
			<Text style={[styles.title, { color: colors.primaryText }]}>
				Save Your RSA Keys
			</Text>
			<Text style={[styles.message, { color: colors.primaryText }]}>
				Please store your private key in a secure location. You will need it to
				decrypt your messages. Once you confirm, the private key will be
				securely stored on your device.
			</Text>

			<View
				style={[
					styles.keyBox,
					{
						borderColor: colors.primary,
						backgroundColor: colors.backgroundColor,
					},
				]}
			>
				<Text style={[styles.label, { color: colors.primaryText }]}>
					Public Key:
				</Text>
				<Text style={[styles.keyText, { color: colors.primaryText }]}>
					{publicKey}
				</Text>
			</View>

			<View
				style={[
					styles.keyBox,
					{
						borderColor: colors.primary,
						backgroundColor: colors.backgroundColor,
					},
				]}
			>
				<Text style={[styles.label, { color: colors.primaryText }]}>
					Private Key:
				</Text>
				<Text style={[styles.keyText, { color: colors.primary }]}>
					{privateKey}
				</Text>
			</View>

			<Button
				title="I have securely stored my private key"
				color={colors.primary}
				onPress={handleConfirm}
				disabled={isConfirmed}
			/>
			{isConfirmed && (
				<Text style={[styles.confirmationText, { color: colors.primaryText }]}>
					Private key successfully stored!
				</Text>
			)}
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		padding: 20,
		flexGrow: 1,
		justifyContent: "center",
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
	},
	message: {
		fontSize: 16,
		marginBottom: 20,
	},
	keyBox: {
		padding: 20,
		borderRadius: 10,
		borderWidth: 2,
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		marginBottom: 10,
	},
	keyText: {
		fontSize: 14,
		fontWeight: "bold",
	},
	confirmationText: {
		marginTop: 20,
		fontSize: 16,
	},
});

export default PrivateKeyScreen;
