import * as PusherExports from "./node_modules/pusher-js/dist/web/pusher.js";
import Echo from "./node_modules/laravel-echo/dist/echo.js";

window.Pusher = Pusher;
window.Echo = new Echo({
	broadcaster: "reverb",
	key: "zsfigqubxmjgwtykp2ps",
	wsHost: "127.0.0.1",
	wsPort: 8080,
	forceTLS: false,
	enabledTransports: ["ws"],
});
