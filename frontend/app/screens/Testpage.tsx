import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	Button,
	StyleSheet,
	ScrollView,
} from "react-native";
import forge from "node-forge";
import { colors } from "../styles/colors";

const EncryptionTestScreen = () => {
	const [privateKey, setPrivateKey] = useState("");
	const [publicKey, setPublicKey] = useState("");
	const [user1Message, setUser1Message] = useState("");
	const [user2Message, setUser2Message] = useState("");
	const [encryptedMessage, setEncryptedMessage] = useState("");
	const [decryptedMessage, setDecryptedMessage] = useState("");

	// Function to ensure proper PEM formatting (trim extra spaces and check headers/footers)
	const formatKey = (key: string, type: "private" | "public") => {
		const trimmedKey = key.trim();

		if (
			type === "private" &&
			!trimmedKey.startsWith("-----BEGIN PRIVATE KEY-----")
		) {
			return `-----BEGIN PRIVATE KEY-----\n${trimmedKey}\n-----END PRIVATE KEY-----`;
		}

		if (
			type === "public" &&
			!trimmedKey.startsWith("-----BEGIN PUBLIC KEY-----")
		) {
			return `-----BEGIN PUBLIC KEY-----\n${trimmedKey}\n-----END PUBLIC KEY-----`;
		}

		return trimmedKey; // Return key if already properly formatted
	};

	const handleEncrypt = () => {
		try {
			const { pki, util } = forge;
			const formattedPublicKey = formatKey(publicKey, "public"); // Format the public key
			const publicKeyObj = pki.publicKeyFromPem(formattedPublicKey);
			const encrypted = publicKeyObj.encrypt(util.encodeUtf8(user2Message));
			setEncryptedMessage(forge.util.encode64(encrypted));
		} catch (error) {
			console.error("Encryption error:", error);
		}
	};

	const handleDecrypt = () => {
		try {
			const { pki, util } = forge;
			const formattedPrivateKey = formatKey(privateKey, "private"); // Format the private key
			const privateKeyObj = pki.privateKeyFromPem(formattedPrivateKey);
			const decrypted = privateKeyObj.decrypt(
				forge.util.decode64(encryptedMessage),
			);
			setDecryptedMessage(util.decodeUtf8(decrypted));
		} catch (error) {
			console.error("Decryption error:", error);
		}
	};

	return (
		<ScrollView
			contentContainerStyle={[
				styles.container,
				{ backgroundColor: colors.backgroundColor },
			]}
		>
			<Text style={[styles.title, { color: colors.primary }]}>
				Encryption Test
			</Text>
			{/* User 1 (Private Key) */}
			<Text style={[styles.subtitle, { color: colors.primaryText }]}>
				User 1 (Private Key)
			</Text>
			<TextInput
				style={[
					styles.keyInput,
					{ color: colors.primaryText, borderColor: colors.primary },
				]}
				value={privateKey}
				onChangeText={setPrivateKey}
				placeholder="Enter Private Key"
				multiline
			/>
			<TextInput
				style={[
					styles.messageInput,
					{ color: colors.primaryText, borderColor: colors.primary },
				]}
				value={user1Message}
				onChangeText={setUser1Message}
				placeholder="Message to decrypt"
			/>
			<Button title="Decrypt" color={colors.primary} onPress={handleDecrypt} />
			{decryptedMessage ? (
				<Text style={[styles.resultText, { color: colors.primaryText }]}>
					Decrypted Message: {decryptedMessage}
				</Text>
			) : null}

			{/* User 2 (Public Key) */}
			<Text style={[styles.subtitle, { color: colors.primaryText }]}>
				User 2 (Public Key)
			</Text>
			<TextInput
				style={[
					styles.keyInput,
					{ color: colors.primaryText, borderColor: colors.primary },
				]}
				value={publicKey}
				onChangeText={setPublicKey}
				placeholder="Enter Public Key"
				multiline
			/>
			<TextInput
				style={[
					styles.messageInput,
					{ color: colors.primaryText, borderColor: colors.primary },
				]}
				value={user2Message}
				onChangeText={setUser2Message}
				placeholder="Message to encrypt"
			/>
			<Button title="Encrypt" color={colors.primary} onPress={handleEncrypt} />
			{encryptedMessage ? (
				<Text style={[styles.resultText, { color: colors.primaryText }]}>
					Encrypted Message: {encryptedMessage}
				</Text>
			) : null}
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
	subtitle: {
		fontSize: 20,
		marginBottom: 10,
	},
	keyInput: {
		height: 100,
		borderWidth: 1,
		borderRadius: 10,
		padding: 10,
		marginBottom: 20,
	},
	messageInput: {
		height: 50,
		borderWidth: 1,
		borderRadius: 10,
		padding: 10,
		marginBottom: 20,
	},
	resultText: {
		fontSize: 16,
		marginTop: 20,
	},
});

export default EncryptionTestScreen;
