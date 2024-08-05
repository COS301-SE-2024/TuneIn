import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { DtoGenService } from "../../dto-gen/dto-gen.service";
import { DbUtilsService } from "../../db-utils/db-utils.service";

@Injectable()
export class RoomQueueService {
	constructor(
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly prisma: PrismaService,
	) {}
}
