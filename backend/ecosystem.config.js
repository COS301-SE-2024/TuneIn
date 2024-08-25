module.exports = {
	apps: [
		{
			name: "tunein-backend",
			script: "./dist/src/main.js", // Our app's entry point
			instances: 1, // We only want 1 instance of our app running
			autorestart: true,
			watch: false, // We don't want PM2 to watch any files and restart the app
			max_memory_restart: "2048M", // Restart the app if it exceeds 2 GB of memory usage
			restart_delay: 5000, // Wait 5 seconds before restarting
			max_restarts: 10, // Try restarting 10 times max
			env: {
				NODE_ENV: "production",
			},
		},
	],
};
