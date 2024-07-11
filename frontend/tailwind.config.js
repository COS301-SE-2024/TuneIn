/** @type {import('tailwindcss').Config} */
module.exports = {
	purge: [
		"./App.{js,jsx,ts,tsx}",
		"./screens/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./app/**/*.{js,jsx,ts,tsx}",
	],
	content: [
		"./App.{js,jsx,ts,tsx}",
		"./screens/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./app/**/*.{js,jsx,ts,tsx}",
	],
	theme: {
		extend: {
			colors: {
				primary: "#E1306C",
				secondary: "#262626",
				background: "#FFFFFF",
				chatBackground: "#F8F8F8",
				chatBubble: "#ECECEC",
				chatBubbleMe: "#08bdbd",
			},
		},
	},
	variants: {},
	plugins: [],
};
