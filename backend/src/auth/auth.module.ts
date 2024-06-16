import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { LocalStrategy } from "./local.strategy";
import { JwtStrategy } from "./jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { UsersService } from "src/modules/users/users.service";
import { DbUtilsService } from "src/modules/db-utils/db-utils.service";
import { DtoGenService } from "src/modules/dto-gen/dto-gen.service";

@Module({
	imports: [
		PassportModule,
		JwtModule.register({
			secret: process.env.JWT_SECRET || "your_jwt_secret",
			signOptions: { expiresIn: "2h" },
		}),
		ConfigModule.forRoot(), // Ensure ConfigModule is imported to access environment variables
		PrismaModule,
	],
	providers: [
		AuthService,
		LocalStrategy,
		JwtStrategy,
		PrismaService,
		DtoGenService,
		DbUtilsService,
		UsersService,
	],
	controllers: [AuthController],
})
export class AuthModule {}
