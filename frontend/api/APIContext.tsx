// src/api/ApiContext.tsx
import React, { createContext, useContext } from "react";
import { Configuration, DefaultApi } from "./../api-client";

const ApiContext = createContext<DefaultApi | null>(null);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const config = new Configuration({ basePath: "http://localhost:3000" });
	const apiService = new DefaultApi(config);

	return (
		<ApiContext.Provider value={apiService}>{children}</ApiContext.Provider>
	);
};

export const useApi = () => {
	const context = useContext(ApiContext);
	if (context === null) {
		throw new Error("useApi must be used within an ApiProvider");
	}
	return context;
};
