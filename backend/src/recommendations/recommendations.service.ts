import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RecommendationsService {
	constructor(private readonly prisma: PrismaService) {}
}
