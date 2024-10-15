// storageService.ts
// import { Platform } from "react-native";

// const isWeb = Platform.OS === "web";
// console.log(`CURRENT PLATFORM: ${Platform.OS}, isWeb: ${isWeb}`);

// // Helper function to safely use localStorage in web environment
// const safeLocalStorage = {
// 	setItem: (key, value) =>
// 		isWeb && window.localStorage
// 			? window.localStorage.setItem(key, value)
// 			: undefined,
// 	getItem: (key) =>
// 		isWeb && window.localStorage ? window.localStorage.getItem(key) : null,
// 	removeItem: (key) =>
// 		isWeb && window.localStorage
// 			? window.localStorage.removeItem(key)
// 			: undefined,
// 	clear: () =>
// 		isWeb && window.localStorage ? window.localStorage.clear() : undefined,
// };

// export const setItem = async (key: string, value: string) => {
// 	if (isWeb) {
// 		safeLocalStorage.setItem(key, value);
// 	} else {
// 		const AsyncStorage = (
// 			await import("@react-native-async-storage/async-storage")
// 		).default;
// 		await AsyncStorage.setItem(key, value);
// 	}
// };

// export const getItem = async (key: string) => {
// 	if (isWeb) {
// 		return safeLocalStorage.getItem(key);
// 	} else {
// 		const AsyncStorage = (
// 			await import("@react-native-async-storage/async-storage")
// 		).default;
// 		return await AsyncStorage.getItem(key);
// 	}
// };

// export const removeItem = async (key: string) => {
// 	if (isWeb) {
// 		safeLocalStorage.removeItem(key);
// 	} else {
// 		const AsyncStorage = (
// 			await import("@react-native-async-storage/async-storage")
// 		).default;
// 		await AsyncStorage.removeItem(key);
// 	}
// };

// export const clear = async () => {
// 	if (isWeb) {
// 		safeLocalStorage.clear();
// 	} else {
// 		const AsyncStorage = (
// 			await import("@react-native-async-storage/async-storage")
// 		).default;
// 		await AsyncStorage.clear();
// 	}
// 	console.log("Storage cleared");
// };

import AsyncStorage from "@react-native-async-storage/async-storage";
export const setItem = async (key: string, value: string) => {
	await AsyncStorage.setItem(key, value);
};

export const getItem = async (key: string) => {
	return await AsyncStorage.getItem(key);
};

export const removeItem = async (key: string) => {
	await AsyncStorage.removeItem(key);
};

export const clear = async () => {
	await AsyncStorage.clear();
	console.log("Storage cleared");
};

export const StorageService = {
	setItem,
	getItem,
	removeItem,
	clear,
};
