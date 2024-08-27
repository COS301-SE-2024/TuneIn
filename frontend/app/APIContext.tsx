// APIContext.tsx
import React, {
	createContext,
	useContext,
	ReactNode,
	useEffect,
	useState,
	useRef,
} from "react";
import {
	AuthApi,
	Configuration,
	DefaultApi,
	GenresApi,
	RoomAnalyticsApi,
	RoomsApi,
	SearchApi,
	UsersApi,
} from "../api";
import * as utils from "./services/Utils";
import auth from "./services/AuthManagement";

interface APIGroup {
	auth: AuthApi;
	default: DefaultApi;
	genres: GenresApi;
	rooms: RoomsApi;
	roomAnalytics: RoomAnalyticsApi;
	search: SearchApi;
	users: UsersApi;
	authenticated: boolean;
	tokenState: {
		token: string | null;
		setToken: React.Dispatch<React.SetStateAction<string | null>>;
	};
}

const APIContext = createContext<APIGroup | undefined>(undefined);

const createAPIGroup = (
	token: string | null,
	setToken: React.Dispatch<React.SetStateAction<string | null>>,
): APIGroup => {
	let config: Configuration;
	if (token === null) {
		config = new Configuration({
			basePath: utils.API_BASE_URL,
		});
	} else {
		config = new Configuration({
			basePath: utils.API_BASE_URL,
			accessToken: token,
		});
	}
	return {
		auth: new AuthApi(config),
		default: new DefaultApi(config),
		genres: new GenresApi(config),
		rooms: new RoomsApi(config),
		roomAnalytics: new RoomAnalyticsApi(config),
		search: new SearchApi(config),
		users: new UsersApi(config),
		authenticated: token !== null,
		tokenState: { token, setToken },
	};
};

export const APIProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [token, setToken] = useState<string | null>(null);
	const apiGroupRef = useRef<APIGroup | null>(null);

	useEffect(() => {
		const fetchToken = async () => {
			const t = await auth.getToken();
			setToken(t);
		};
		fetchToken();
	}, []);

	useEffect(() => {
		if (
			token !== null &&
			(apiGroupRef.current === null ||
				apiGroupRef.current.tokenState.token !== token)
		) {
			apiGroupRef.current = createAPIGroup(token, setToken);
		}
	}, [token]);

	if (!apiGroupRef.current) {
		// Ensure that APIGroup is only created after the token is fetched
		apiGroupRef.current = createAPIGroup(token, setToken);
	}

	return (
		<APIContext.Provider value={apiGroupRef.current}>
			{children}
		</APIContext.Provider>
	);
};

export const useAPI = () => {
	const context = useContext(APIContext);
	if (!context) {
		throw new Error("useAPI must be used within an APIProvider");
	}

	const fetchTokenAndUpdateContext = async () => {
		const t = await auth.getToken();
		if (context.tokenState.token !== t) {
			context.tokenState.setToken(t);
			// const updatedContext = createAPIGroup(t, context.tokenState.setToken);
			// return updatedContext;
		}
		return context;
	};
	return fetchTokenAndUpdateContext().then(() =>
		console.log("useAPI: token fetched and context updated"),
	);
};
