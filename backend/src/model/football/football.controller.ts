import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateFootballDto } from "./dto/create-football.dto";
import { FootballService } from "./football.service";
import { Football } from "./schemas/football.schema";

@Controller("football")
export class FootballController {
	constructor(private readonly footballService: FootballService) {
	}

	@Post()
	async create(@Body() createCatDto: CreateFootballDto) {
		/*await this.footballService.create(createCatDto);*/
	}

	@Get()
	async findAll(): Promise<Football[]> {
		return this.footballService.getDataByParam();
	}
}
