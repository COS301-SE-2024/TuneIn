import { Module } from "@nestjs/common";
import { GenresService } from "./genres.service";
import { GenresController } from "./genres.controller";
import { PrismaModule } from "../../../prisma/prisma.module";

@Module({
	imports: [PrismaModule],
	providers: [GenresService],
	controllers: [GenresController],
})
export class GenresModule {}
