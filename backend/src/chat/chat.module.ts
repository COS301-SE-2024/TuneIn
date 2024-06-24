import { Module } from "@nestjs/common";
import { DbUtilsModule } from "src/modules/db-utils/db-utils.module"; // Assuming this exists
import { DtoGenModule } from "src/modules/dto-gen/dto-gen.module"; // Assuming this exists
import { RoomsModule } from "src/modules/rooms/rooms.module";
import { ConnectedUsersModule } from "./connecteduser/connecteduser.module";

@Module({
	imports: [ConnectedUsersModule, DbUtilsModule, DtoGenModule, RoomsModule],
	exports: [ConnectedUsersModule],
})
export class ChatModule {}
