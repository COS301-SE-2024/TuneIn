import { PartialType } from "@nestjs/swagger";
import { RoomDto } from "./room.dto";

export class CreateRoomDto extends PartialType(RoomDto) {}
