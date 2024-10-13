import React from "react";
import {
	Text,
	View,
	ImageBackground,
	TouchableOpacity,
	Dimensions,
	StyleSheet,
	ToastAndroid,
} from "react-native";
import { useRouter } from "expo-router";
import * as utils from "../services/Utils";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import CyanButton from "../components/CyanButton";
import WhiteButton from "../components//WhiteButton";
import {
	DiscoveryDocument,
	makeRedirectUri,
	ResponseType,
	useAuthRequest,
} from "expo-auth-session";
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from "react-native-dotenv";
import { generateRandom } from "expo-auth-session/build/PKCE";
import {
	exchangeCodeWithBackend,
	SpotifyCallbackResponse,
} from "../services/SpotifyAuth";
import { live } from "../services/Live";
import auth from "../services/AuthManagement";
import { colors } from "../styles/colors";

const WelcomeScreen: React.FC = () => {
	const router = useRouter();
	const { width, height } = Dimensions.get("window");

	const navigateToHelp = () => {
		router.navigate("/screens/(tabs)/HelpScreen");
	};

	const redirectURI = makeRedirectUri({
		scheme: "tunein-app",
		path: "screens/Auth/SpotifyRedirect",
		native: "tunein-app://screens/Auth/SpotifyRedirect", // Use the 'native' option for standalone or native contexts
		preferLocalhost: true,
	});

	const makeStateVariable = (redirectURI: string) => {
		const state = {
			"unique-pre-padding": generateRandom(10),
			"expo-redirect": redirectURI,
			"ip-address": utils.API_BASE_NO_PORT,
			"redirect-used": SPOTIFY_REDIRECT_URI,
			"unique-post-padding": generateRandom(10),
		};
		const bytes = new TextEncoder().encode(JSON.stringify(state));
		const b64 = utils.bytesToBase64(bytes);
		return b64;
	};

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

	const state = React.useMemo(
		() => makeStateVariable(redirectURI),
		[redirectURI],
	);

	const [request, response, promptAsync] = useAuthRequest(
		{
			clientId: SPOTIFY_CLIENT_ID,
			//redirectUri: SPOTIFY_REDIRECT_URI,
			redirectUri: redirectURI,
			responseType: ResponseType.Code,
			scopes: [scopes.join(" ")],
			usePKCE: false,
			state: state,
		},
		discovery,
	);

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
					router.navigate("screens/(tabs)/Home");
				};
				doExchange();
			} else {
				ToastAndroid.show(
					"Failed to authenticate. Please try again.",
					ToastAndroid.SHORT,
				);
			}
		}
	}, [response, redirectURI, router]);

	return (
		<View style={styles.container}>
			<View style={styles.imageContainer}>
				<ImageBackground
					source={require("../../assets/logo8.png")}
					style={[styles.imageBackground, { width, height: height * 0.6 }]}
					resizeMode="cover"
				>
					<TouchableOpacity
						style={styles.helpButton}
						onPress={navigateToHelp}
						testID="help-button"
					>
						<MaterialCommunityIcons
							name="help-circle-outline"
							size={24}
							color="#FFF"
							style={styles.helpIcon}
						/>
					</TouchableOpacity>
				</ImageBackground>
			</View>
			<View style={styles.innerContainer}>
				<TouchableOpacity
					style={styles.button}
					onPress={() => {
						promptAsync();
					}}
					testID="spotify-login-button"
				>
					<FontAwesome
						name="spotify"
						size={24}
						color="#000"
						style={styles.icon}
					/>
					<Text style={styles.buttonText}>Login With Spotify</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		backgroundColor: "#FFF",
	},
	imageContainer: {
		paddingTop: 60,
		flex: 1,
		justifyContent: "center",
	},
	imageBackground: {
		width: "100%",
		height: "50%",
	},
	innerContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 16,
	},
	logoText: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 20,
	},
	titleText: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 32,
	},
	helpButton: {
		position: "absolute",
		top: 20,
		right: 20,
		backgroundColor: "transparent",
		padding: 10,
	},
	helpIcon: {
		marginRight: 5,
	},
	button: {
		width: "92%",
		height: 52,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: colors.primary,
		borderRadius: 56,
		marginBottom: 20,
		flexDirection: "row",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	buttonText: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#FFF",
	},
	icon: {
		color: "white",
		marginRight: 10,
	},
});

export default WelcomeScreen;
