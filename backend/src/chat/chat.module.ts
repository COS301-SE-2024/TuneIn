import { Module } from "@nestjs/common";
import { DbUtilsModule } from "../modules/db-utils/db-utils.module"; // Assuming this exists
import { DtoGenModule } from "../modules/dto-gen/dto-gen.module"; // Assuming this exists
import { RoomsModule } from "../modules/rooms/rooms.module";
import { ConnectedUsersModule } from "./connecteduser/connecteduser.module";
import { ChatGateway } from "./chat.gateway";

@Module({
	imports: [ConnectedUsersModule, DbUtilsModule, DtoGenModule, RoomsModule],
	exports: [ConnectedUsersModule, ChatGateway],
	providers: [ChatGateway],
})
export class ChatModule {}
