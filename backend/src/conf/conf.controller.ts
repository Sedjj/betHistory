import { Controller, Get, Post, Body } from '@nestjs/common';
import { CreateConfDto } from './dto/create-conf.dto';
import { ConfService } from './conf.service';
import { IConf } from './type/conf.type';

@Controller('conf')
export class ConfController {
	constructor(private readonly confService: ConfService) {}

	@Post()
	async create(@Body() createConfDto: CreateConfDto) {
		this.confService.create(createConfDto);
	}

	@Get()
	async findAll(): Promise<IConf[]> {
		return this.confService.findAll();
	}
}