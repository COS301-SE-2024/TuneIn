import "dotenv/config";
export default ({ config }) => ({
	...config,
	android: {
		package: "com.Apollo.TuneIn",
	},
	ios: {
		bundleIdentifier: "com.Apollo.TuneIn",
	},
	expo: {
		extra: {
			eas: {
				projectId: "0b7f95d1-330a-423a-ab7d-de539d6d9bfb",
			},
		},
	},
	owner: "apollotunein",
});
