import { Injectable } from "@nestjs/common";
import sharp from "sharp";

@Injectable()
export class ImageService {
	/**
	 * Process the image by converting it to JPEG format and compressing it
	 * @param imageBuffer The image buffer to process
	 * @param maxSize The maximum size of the image in bytes
	 * @returns The processed image buffer
	 */
	async compressImage(imageBuffer: Buffer, maxSize: number): Promise<Buffer> {
		if (imageBuffer.length < maxSize) {
			return imageBuffer;
		}
		let processedImageBuffer: Buffer = imageBuffer;
		for (let i = 100; i > 0; i -= 10) {
			// Convert and compress the image
			processedImageBuffer = await sharp(imageBuffer)
				.toFormat("jpeg") // Convert to JPEG or PNG
				.jpeg({ quality: i }) // Compress JPEG, adjust the quality if necessary
				.toBuffer();

			// Check if the processed image exceeds 256KB
			if (processedImageBuffer.length < maxSize) {
				break;
			}
		}
		if (processedImageBuffer.length > maxSize) {
			throw new Error("Image is too large");
		}
		return processedImageBuffer;
	}

	/**
	 * Process the image by converting it to base64 format
	 * @param imageBuffer The image buffer to process
	 * @returns The processed image in base64 format
	 */
	imageToB64(imageBuffer: Buffer): string {
		return imageBuffer.toString("base64");
	}
}
