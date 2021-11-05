import {Body, Controller, Get, Logger, OnApplicationBootstrap, Post} from '@nestjs/common';
import {FiltersService} from './filters.service';
import {IFilters} from './type/filters.type';

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
						name: 'Austrian Bundesliga',
						enable: 1,
					},
					{
						name: 'Canadian',
						enable: 1,
					},
				],
			})
			.then((response: null | IFilters) => response && this.logger.debug(`Filters migration in bd`));
	}

	@Post()
	async create(@Body() conf: IFilters) {
		await this.filtersService.create(conf);
		this.logger.debug(`Create conf: ${conf}`);
	}

	@Get()
	async findAll(): Promise<IFilters> {
		return this.filtersService.getDataByParam(1);
	}
}
