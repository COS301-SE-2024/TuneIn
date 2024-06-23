import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { UserError } from "../exceptions/user-error";

@Catch(Error, WsException, UserError) // Catch both generic errors and WebSocket-specific exceptions
export class WsExceptionFilter implements ExceptionFilter {
	catch(exception: Error, host: ArgumentsHost) {
		const client = host.switchToWs().getClient<Socket>();
		let message = "Internal server error";

		if (exception instanceof UserError) {
			message = exception.message;
		}
		console.error(exception);

		console.error("@@@@@@@@@@@@@@@@@");
		client.emit("error", { message }); // Send the error message to the client
	}
}
