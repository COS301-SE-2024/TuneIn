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

	const usersAPI: UsersApi = new UsersApi(config);

	const getUser = async (username: string): Promise<UserDto> => {
		let user: UserDto | null = null;
		usersAPI
			.getProfileByUsername(username)
			.then((response) => {
				user = response.data;
			})
			.catch((error) => {
				console.error(error);
			});
		if (user === null) {
			throw new Error("Failed to fetch user @ " + username);
		}
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
		authenticated: token !== null,
		tokenState: { token, setToken },
		getUser,
	};
};

export const APIProvider: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [token, setToken] = useState<string | null>(null);
	const apiGroupRef = useRef<APIGroup | null>(null);

	useEffect(() => {
		const fetchToken = async () => {
			if (auth.authenticated()) {
				const t = await auth.getToken();
				setToken(t);
			}
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
	let context = useContext(APIContext);
	if (!context) {
		throw new Error("useAPI must be used within an APIProvider");
	}

	const fetchTokenAndUpdateContext = async () => {
		const t = await auth.getToken();

		// TypeScript won't shut up without this check
		if (!context) {
			throw new Error("useAPI must be used within an APIProvider");
		}

		if (context.tokenState.token !== t) {
			context.tokenState.setToken(t);
		}
	};
	fetchTokenAndUpdateContext().then(() => console.log("Token refreshed"));

	context = useContext(APIContext);
	// TypeScript won't shut up without this check (part 2)
	if (!context) {
		throw new Error("useAPI must be used within an APIProvider");
	}
	return context;
};
