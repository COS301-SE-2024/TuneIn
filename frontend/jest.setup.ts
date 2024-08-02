// jest.setup.js
import dotenv from "dotenv";
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

dotenv.config({ path: ".env" });
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);
