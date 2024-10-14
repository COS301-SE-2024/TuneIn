// APIContext.tsx
import React, {
	createContext,
	useContext,
	ReactNode,
	useEffect,
	useState,
	useRef,
	useCallback,
} from "react";
import {
	AuthApi,
	Configuration,
	DefaultApi,
	GenresApi,
	RoomAnalyticsApi,
	RoomsApi,
	SearchApi,
	UserDto,
	UsersApi,
} from "../api";
import * as utils from "./services/Utils";
import auth from "./services/AuthManagement";

interface APIGroup {
	auth: AuthApi;
	default: DefaultApi;
	genres: GenresApi;
	roomAnalytics: RoomAnalyticsApi;
	rooms: RoomsApi;
	search: SearchApi;
	users: UsersApi;
	authenticated: boolean;
	tokenState: {
		token: string | null;
		setToken: React.Dispatch<React.SetStateAction<string | null>>;
	};
	getUser: (username: string) => Promise<UserDto>;
}

const APIContext = createContext<APIGroup | undefined>(undefined);

const createAPIGroup = (
	token: string | null,
	setToken: React.Dispatch<React.SetStateAction<string | null>>,
	authenticated: boolean,
): APIGroup => {
	console.log("Creating new API group");
	let config: Configuration;
	if (token === null) {
		config = new Configuration({
			basePath: utils.API_BASE_URL,
		});
	} else {
		console.log("Created authenticated API group");
		config = new Configuration({
			basePath: utils.API_BASE_URL,
			accessToken: token,
		});
	}

	const usersAPI: UsersApi = new UsersApi(config);

	const getUser = async (username: string): Promise<UserDto> => {
		let user: UserDto = await usersAPI
			.getProfileByUsername(username)
			.then((response) => {
				return response.data;
			})
			.catch((error) => {
				console.error(error);
				throw error;
			});
		return user;
	};

	return {
		auth: new AuthApi(config),
		default: new DefaultApi(config),
		genres: new GenresApi(config),
		rooms: new RoomsApi(config),
		roomAnalytics: new RoomAnalyticsApi(config),
		search: new SearchApi(config),
		users: usersAPI,
		authenticated,
		tokenState: { token, setToken },
		getUser,
	};
};

export const APIProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [token, setToken] = useState<string | null>(null);
	const [authenticated, setAuthenticated] = useState<boolean>(false);
	const apiGroupRef = useRef<APIGroup | null>(null);

	useEffect(() => {
		const fetchToken = async () => {
			if (auth.authenticated()) {
				const t = await auth.getToken();
				if (t !== null && t !== token) {
					setToken(t);
					console.log(`Initialised token to: ${t}`);
				}
			}
		};
		fetchToken();
	}, []);

	useEffect(() => {
		if (token === null) {
			if (authenticated) {
				setAuthenticated(false);
				return;
			}
		} else {
			if (!authenticated) {
				setAuthenticated(true);
			}

			if (
				apiGroupRef.current === null ||
				apiGroupRef.current.tokenState.token !== token
			) {
				apiGroupRef.current = createAPIGroup(token, setToken, true);
			}
		}
	}, [token]);

	if (apiGroupRef.current === null) {
		// Ensure that APIGroup is only created after the token is fetched
		apiGroupRef.current = createAPIGroup(token, setToken, authenticated);
	}

	return (
		<APIContext.Provider value={apiGroupRef.current}>
			{children}
		</APIContext.Provider>
	);
};

export const useAPI = () => {
	const contextRef = useRef<APIGroup | undefined>(useContext(APIContext));
	if (!contextRef.current) {
		throw new Error("useAPI must be used within an APIProvider");
	}

	const fetchTokenAndUpdateContext = useCallback(async () => {
		if (auth.authenticated()) {
			const t = await auth.getToken();

			// TypeScript won't shut up without this check
			if (!contextRef.current) {
				throw new Error("useAPI must be used within an APIProvider");
			}

			if (contextRef.current.tokenState.token !== t && t !== null) {
				console.log("Updating APIContext token to: ", t);
				contextRef.current.tokenState.setToken(t);
				contextRef.current = createAPIGroup(
					t,
					contextRef.current.tokenState.setToken,
					true,
				);
			}
		}
	}, []);
	fetchTokenAndUpdateContext();
	return contextRef.current;
};
