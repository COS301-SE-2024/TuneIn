import dotenv from "dotenv";
import readline from "readline";
import * as SpotifyApi from "@spotify/web-api-ts-sdk";

dotenv.config();

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectTarget = "http://localhost:3000/auth/spotify/callback"; // Change to your redirect URL

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
].join(" ");

const authUrl =
	`https://accounts.spotify.com/authorize` +
	`?client_id=${clientId}` +
	`&response_type=code` + // Change response_type to 'code'
	`&redirect_uri=${encodeURIComponent(redirectTarget)}` +
	`&show_dialog=true` +
	`&scope=${encodeURIComponent(scopes)}`;

console.log(
	`Navigate to the following URL to authenticate with Spotify:\n${authUrl}`,
);

//receive URL in Terminal
const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

rl.question("Enter the URL you were redirected to: ", async (redirect) => {
	console.log(`URL entered: ${redirect}`);
	rl.close();

	//extract code from URL
	const url = new URL(redirect);
	const code = url.searchParams.get("code");
	console.log(`Code extracted: ${code}`);

    let details;

    //exchange code for access token
    await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded",
            Authorization:
                "Basic " +
                Buffer.from(clientId + ":" + clientSecret).toString("base64"),
        },
        body: new URLSearchParams({
            grant_type: "authorization_code",
            code: code,
            redirect_uri: redirectTarget,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            details = data;
            console.log(details);
        })
        .catch((error) => {
            console.error("Error:", error);
        });

	let sdk = SpotifyApi.SpotifyApi.withAccessToken(clientId, details);
    let user = await sdk.currentUser.profile();
    console.log(user);
});
