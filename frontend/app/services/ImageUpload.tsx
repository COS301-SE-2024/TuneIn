import { Upload } from "@aws-sdk/lib-storage";
import { S3 } from "@aws-sdk/client-s3";
import "react-native-get-random-values";
import { Buffer } from "buffer"; // Import Buffer

import {
	AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY,
	AWS_S3_BUCKET_NAME,
	AWS_S3_REGION,
	AWS_S3_ENDPOINT,
} from "react-native-dotenv";

if (!AWS_ACCESS_KEY_ID) {
	throw new Error(
		"No AWS access key ID (AWS_ACCESS_KEY_ID) provided in environment variables",
	);
}

const _AWS_SECRET_ACCESS_KEY = AWS_SECRET_ACCESS_KEY;
if (!_AWS_SECRET_ACCESS_KEY) {
	throw new Error(
		"No AWS secret access key (AWS_SECRET_ACCESS_KEY) provided in environment variables",
	);
}

if (!AWS_S3_BUCKET_NAME) {
	throw new Error(
		"No AWS bucket name (AWS_S3_BUCKET_NAME) provided in environment variables",
	);
}

if (!AWS_S3_REGION) {
	throw new Error(
		"No AWS region (AWS_S3_REGION) provided in environment variables",
	);
}

if (!AWS_S3_ENDPOINT) {
	throw new Error(
		"No AWS endpoint (AWS_S3_ENDPOINT) provided in environment variables",
	);
}

// Create an S3 instance
const s3 = new S3({
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
	},
	region: AWS_S3_REGION,
	logger: console,
});

const blobToBuffer = (blob: Blob): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			resolve(Buffer.from(reader.result as ArrayBuffer));
		};
		reader.onerror = (error) => {
			reject(error);
		};
		reader.readAsArrayBuffer(blob);
	});
};

const uploadImage = async (imageURI: string, roomName: string) => {
	try {
		const response = await fetch(imageURI);
		const blob: Blob = await response.blob();
		const buffer = await blobToBuffer(blob); // Convert Blob to Buffer
		const params = {
			Bucket: AWS_S3_BUCKET_NAME, // replace with your bucket name
			Key: `${new Date().toISOString()}-${roomName.replace(" ", "-").toLowerCase()}.jpeg`, // replace with the destination key
			Body: buffer,
			ContentType: blob.type,
		};
		const data = await new Upload({
			client: s3,
			params,
		}).done();
		console.log("Successfully uploaded image", data.Location);
		return data.Location;
	} catch (error) {
		console.error("Error uploading image:", error);
		return null;
	}
};

export default uploadImage;
