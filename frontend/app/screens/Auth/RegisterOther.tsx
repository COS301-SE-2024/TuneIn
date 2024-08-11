import * as React from "react";
import {
	makeRedirectUri,
	useAuthRequest,
	DiscoveryDocument,
	ResponseType,
} from "expo-auth-session";
//import { generateRandom } from "expo-auth-session/build/PKCE";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
	Poppins_400Regular,
	Poppins_500Medium,
	Poppins_700Bold,
	useFonts,
} from "@expo-google-fonts/poppins";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import {
	SPOTIFY_CLIENT_ID,
	SPOTIFY_REDIRECT_TARGET,
} from "react-native-dotenv";
import {
	exchangeCodeWithBackend,
	SpotifyCallbackResponse,
} from "../../services/SpotifyAuth";
import auth from "../../services/AuthManagement";
import * as utils from "../../services/Utils";
import { generateRandom } from "expo-auth-session/build/PKCE";
import { live } from "../../services/Live";

const clientId = SPOTIFY_CLIENT_ID;
if (!clientId) {
	throw new Error(
		"No Spotify client ID (SPOTIFY_CLIENT_ID) provided in environment variables 2",
	);
}

const redirectTarget = SPOTIFY_REDIRECT_TARGET;
if (!redirectTarget) {
	throw new Error(
		"No redirect target (SPOTIFY_REDIRECT_TARGET) provided in environment variables",
	);
}

const scopes = [
	"user-read-email",
	"user-library-read",
	"user-read-recently-played",
	"user-top-read",
	"playlist-read-private",
	"playlist-read-collaborative",
	"playlist-modify-public", // or "playlist-modify-private"
	"user-modify-playback-state",
	"user-read-playback-state",
	"user-read-currently-playing",
];

const discovery: DiscoveryDocument = {
	authorizationEndpoint: "https://accounts.spotify.com/authorize",
};

//how state is defined in the expo-auth-session library
//this.state = request.state ?? PKCE.generateRandom(10);

const makeStateVariable = (redirectURI: string) => {
	const state = {
		"unique-pre-padding": generateRandom(10),
		"expo-redirect": redirectURI,
		"ip-address": utils.LOCALHOST,
		"redirect-used": SPOTIFY_REDIRECT_TARGET,
		"unique-post-padding": generateRandom(10),
	};
	const bytes = new TextEncoder().encode(JSON.stringify(state));
	const b64 = utils.bytesToBase64(bytes);
	return b64;
};

const RegisterOtherScreen: React.FC = () => {
	const router = useRouter();
	if (Platform.OS === "web") {
		console.log(WebBrowser.maybeCompleteAuthSession());
	}
	const redirectURI = makeRedirectUri({
		scheme: "tunein-app",
		path: "screens/Auth/SpotifyRedirect",
		native: "tunein-app://screens/Auth/SpotifyRedirect", // Use the 'native' option for standalone or native contexts
		preferLocalhost: true,
	});
	console.log("Redirect URI:", redirectURI);

	const state = React.useMemo(
		() => makeStateVariable(redirectURI),
		[redirectURI],
	);
	console.log("State:", state);

	const [request, response, promptAsync] = useAuthRequest(
		{
			clientId: SPOTIFY_CLIENT_ID,
			//redirectUri: SPOTIFY_REDIRECT_TARGET,
			redirectUri: redirectURI,
			responseType: ResponseType.Code,
			scopes: [scopes.join(" ")],
			extraParams: {
				show_dialog: "true",
			},
			usePKCE: false,
			state: state,
		},
		discovery,
	);

	console.log("Request:", request);
	console.log("Response:", response);
	console.log("PromptAsync (below)");
	console.log(promptAsync);

	React.useEffect(() => {
		console.log("Response:", response);
		if (response && response !== null) {
			if (response?.type === "success") {
				if (response.params.error) {
					console.error("Error:", response.params.error);
					return;
				}
				const { code, state } = response.params;
				console.log("Code:", code);

				//make post request to backend server get access token
				const doExchange = async () => {
					const tokens: SpotifyCallbackResponse = await exchangeCodeWithBackend(
						code,
						state,
						redirectURI,
					);
					await auth.setToken(tokens.token);
					live.initialiseSocket();
					router.navigate("screens/Home");
				};
				doExchange();
			} else {
				throw new Error(
					"Received unsuccessful response from Spotify. Please try again.",
				);
			}
		}
	}, [response, redirectURI, router]);

	let [fontsLoaded] = useFonts({
		Poppins_400Regular,
		Poppins_500Medium,
		Poppins_700Bold,
	});

	if (!fontsLoaded) {
		return null;
	}

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={24} color="black" />
				</TouchableOpacity>
			</View>
			<Text style={styles.welcomeText}>Authenticate With</Text>
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={[styles.button, styles.otherButton]}
					onPress={() => {
						promptAsync();
					}}
				>
					<FontAwesome
						name="spotify"
						size={24}
						color="#000"
						style={styles.icon}
					/>
					<Text style={styles.buttonText}>Spotify</Text>
				</TouchableOpacity>
				<View style={styles.dividerContainer}>
					<View style={styles.divider} />
					<Text style={styles.dividerText}>Or Login with TuneIn Details</Text>
					<View style={styles.divider} />
				</View>
				<TouchableOpacity
					style={[styles.button, styles.otherButton]}
					onPress={() => router.navigate("screens/RegisterScreen")}
				>
					<Text style={styles.buttonText}>Account</Text>
				</TouchableOpacity>
			</View>
			<TouchableOpacity
				style={styles.registerContainer}
				onPress={() => router.navigate("screens/LoginStreaming")}
			>
				<Text style={styles.registerText}>
					Don’t have an account?{" "}
					<Text style={styles.registerBoldText}>Register Now</Text>
				</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 20,
		paddingHorizontal: 16,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
	},
	backButton: {
		marginRight: "auto",
	},
	backText: {
		fontSize: 24,
		fontWeight: "bold",
	},
	welcomeText: {
		fontSize: 32,
		fontWeight: "bold",
		fontFamily: "Poppins_700Bold",
		textAlign: "center",
		marginTop: 30,
		marginBottom: 50,
		paddingHorizontal: 20,
	},
	buttonContainer: {
		alignItems: "center",
	},
	button: {
		width: "75%",
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 20,
		borderRadius: 30,
		flexDirection: "row",
		paddingHorizontal: 10,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3.84,
	},
	otherButton: {
		backgroundColor: "#FFFFFF",
		borderColor: "#808080",
		borderWidth: 1,
	},
	icon: {
		marginRight: 10,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#000",
		fontFamily: "Poppins_700Bold",
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
		width: "80%",
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#808080",
	},
	dividerText: {
		marginHorizontal: 10,
		fontSize: 14,
		color: "#000",
		fontFamily: "Poppins_500Medium",
	},
	registerContainer: {
		position: "absolute",
		bottom: 16,
		left: 0,
		right: 0,
		padding: 16,
		alignItems: "center",
	},
	registerText: {
		fontSize: 16,
		color: "#000",
		fontFamily: "Poppins_500Medium",
	},
	registerBoldText: {
		fontWeight: "bold",
		fontFamily: "Poppins_700Bold",
	},
});

export default RegisterOtherScreen;
