import { Socket } from "socket.io-client";

export { };
declare module "strings";

declare global {
	interface Window {
		socket: Socket;
	}

	interface User {
		loggedIn: boolean;
		isAdmin: boolean;
	}
}