import {Body, Controller, Get, Logger, OnApplicationBootstrap, Post} from '@nestjs/common';
import {FiltersService} from './filters.service';
import {Filters} from './schemas/filters.schema';

@Controller('filters')
export class FiltersController implements OnApplicationBootstrap {
	private readonly logger = new Logger(FiltersController.name);

	constructor(private readonly filtersService: FiltersService) {}

	onApplicationBootstrap() {
		this.filtersService
			.create({
				confId: 1,
				groups: [
					{
						name: 'Austria"Austrian Bundesliga"enable: 1,
					}
					{
						name: 'Canadia"Canadian"enable: 1,
					}
				],				createdBy: new Date().toISOString(),
				modifiedBy: new Date().toISOString(),
			})
		.then((response: null | Filters) => response && this.logger.debug(`Filters migration in bd`));
	}

	@Post()
	async create(@Body() conf: Filters) {
		await this.filtersService.create(conf);
		this.logger.debug(`Create conf: ${conf}`);
	}

	@Get()
	async findAll(): Promise<Filters> {
		return this.filtersService.getDataByParam(1);
	}
}
