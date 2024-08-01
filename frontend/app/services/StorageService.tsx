// storageService.ts
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

export const setItem = async (key: string, value: string) => {
	if (isWeb) {
		localStorage.setItem(key, value);
	} else {
		const AsyncStorage = (
			await import("@react-native-async-storage/async-storage")
		).default;
		await AsyncStorage.setItem(key, value);
	}
};

export const getItem = async (key: string) => {
	if (isWeb) {
		return localStorage.getItem(key);
	} else {
		const AsyncStorage = (
			await import("@react-native-async-storage/async-storage")
		).default;
		return await AsyncStorage.getItem(key);
	}
};

export const removeItem = async (key: string) => {
	if (isWeb) {
		localStorage.removeItem(key);
	} else {
		const AsyncStorage = (
			await import("@react-native-async-storage/async-storage")
		).default;
		await AsyncStorage.removeItem(key);
	}
};

export const clear = async () => {
	if (isWeb) {
		localStorage.clear();
	} else {
		const AsyncStorage = (
			await import("@react-native-async-storage/async-storage")
		).default;
		await AsyncStorage.clear();
	}
};
