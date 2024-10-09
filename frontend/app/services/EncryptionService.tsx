import * as SecureStore from "expo-secure-store";
import axios from "axios";
import nacl from "tweetnacl";
import * as utils from "./Utils";
// import { AES, enc } from "crypto-js";

// Types for key pairs and encryption/decryption functions
type KeyPair = {
	publicKey: string;
	privateKey: string;
};

// Generate and store the public/private key pair
export async function generateKeyPair(): Promise<KeyPair> {
	const keyPair = nacl.box.keyPair();

	// Convert keys to hexadecimal strings for storage
	const publicKey = Buffer.from(keyPair.publicKey).toString("hex");
	const privateKey = Buffer.from(keyPair.secretKey).toString("hex");

	// Store private key securely
	await SecureStore.setItemAsync("privateKey", privateKey);
	await SecureStore.setItemAsync("publicKey", publicKey);

	try {
		await axios.post(`${utils.API_BASE_URL}/users/${publicKey}/publicKey`);
	} catch (err) {
		console.log("Error uploading public key", err);
	}

	// Return the keys for usage (public key to be sent to the server)
	return { publicKey, privateKey };
}

// Encrypt a message using the recipient's public key
export async function encryptMessage(
	message: string,
	recipientPublicKey: string,
): Promise<string> {
	const publicKeyUint8Array = Buffer.from(recipientPublicKey, "hex");
	const privateKey: string =
		(await SecureStore.getItemAsync("privateKey")) || "";
	const privateKeyUint8Array = Buffer.from(privateKey, "hex");
	const messageUint8Array = Buffer.from(message, "utf-8");
	const nonce = nacl.randomBytes(24); // Generate a nonce for encryption

	// Encrypt the message
	const encryptedMessage = nacl.box(
		messageUint8Array,
		nonce,
		publicKeyUint8Array,
		privateKeyUint8Array,
	);

	return Buffer.concat([nonce, encryptedMessage]).toString("hex"); // Concatenate nonce + message
}

// Decrypt the encrypted message using the private key
export async function decryptMessage(
	encryptedMessage: string,
): Promise<string> {
	const privateKey: string =
		(await SecureStore.getItemAsync("privateKey")) || "";
	const publicKey: string = (await SecureStore.getItemAsync("publicKey")) || "";

	if (privateKey === "" || publicKey === "") {
		console.error("Missing private or public key");
		return "";
	}

	const privateKeyUint8Array = Buffer.from(privateKey, "hex");
	const publicKeyUint8Array = Buffer.from(publicKey, "hex"); // Changed to "hex"
	const encryptedBytes: Buffer = Buffer.from(encryptedMessage, "hex");

	// Extract the nonce and the message
	const nonce = encryptedBytes.slice(0, 24); // First 24 bytes are the nonce
	const ciphertext = encryptedBytes.slice(24); // Remaining bytes are the ciphertext

	// Decrypt the message
	const decryptedMessage = nacl.box.open(
		ciphertext,
		nonce,
		publicKeyUint8Array, // Use the public key from the SecureStore
		privateKeyUint8Array,
	);

	// Handle the null case when decryption fails
	if (!decryptedMessage) {
		console.error(
			"Decryption failed. Possibly wrong keys or corrupted message.",
		);
		return "";
	}

	return Buffer.from(decryptedMessage).toString("utf-8"); // Return the decrypted message as a string
}

export async function handleUserLogin(): Promise<void> {
	try {
		const privateKey = await SecureStore.getItemAsync("privateKey");

		if (!privateKey) {
			// Generate a new key pair and store it securely if private key is missing
			console.log("Private key not found. Generating new key pair...");
			await generateKeyPair();
		} else {
			console.log("Private key found. Ready for decryption.");
		}
	} catch (error) {
		console.error("Error handling private key:", error);
	}
}
