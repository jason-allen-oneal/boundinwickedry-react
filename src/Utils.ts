import { Socket } from "socket.io-client";

export default class Utils {
	socket: Socket;
	constructor(socket: Socket) {
		this.socket = socket;
	}

	async request(target: string, input: any = null): Promise<any> {
		this.socket.emit(target, input);
		await new Promise((resolve) => {
			this.socket.on(target + "-response", (data) => {
				resolve(data);
			});
		});
	}
}