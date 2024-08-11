// polyfills.js
if (typeof global.Buffer === "undefined") {
	global.Buffer = require("buffer").Buffer;
}

global.events = require("events");
global.stream = require("stream-browserify");
