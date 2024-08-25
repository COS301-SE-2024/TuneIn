module.exports = {
	apps: [
		{
			name: "tunein-backend",
			script: "./dist/src/main.js", // Adjust the path to your app's entry point
			instances: 1,
			autorestart: true,
			watch: false,
			max_memory_restart: "512M",
		},
	],
};
