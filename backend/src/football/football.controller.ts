import {Body, Controller, Get, Post} from '@nestjs/common';
import {CreateFootballDto} from './dto/create-football.dto';
import {FootballService} from './football.service';
import {IFootball} from './interfaces/football.interface';

@Controller('football')
export class FootballController {
	constructor(private readonly footballService: FootballService) {}

	@Post()
	async create(@Body() createCatDto: CreateFootballDto) {
		await this.footballService.create(createCatDto);
	}

	@Get()
	async findAll(): Promise<IFootball[]> {
		return this.footballService.getDataByParam();
	}
}