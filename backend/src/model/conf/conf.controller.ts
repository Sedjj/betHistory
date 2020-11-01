import {Body, Controller, Get, Logger, OnApplicationBootstrap, Post} from '@nestjs/common';
import {ConfService} from './conf.service';
import {IConf} from './type/conf.type';

@Controller('conf')
export class ConfController implements OnApplicationBootstrap {
	private readonly logger = new Logger(ConfController.name);

	constructor(private readonly confService: ConfService) {}

	onApplicationBootstrap() {
		this.confService
			.create({
				confId: 1,
				betAmount: 1,
				time: [
					{
						before: 0,
						after: 0,
					},
					{
						// 1
						before: 0,
						after: 60,
					},
					{
						// 2
						before: 25,
						after: 35,
					},
					{
						// 3
						before: 45,
						after: 45,
					},
					{
						// 4
						before: 0,
						after: 2,
					},
					{
						// 5
						before: 15,
						after: 17,
					},
				],
				typeRate: [1.5, 1.5, 1.5, 0.5, 0.5, 0.5, 0.5],
				rate: [
					{
						title: 'Math.abs(p1 - p2) < rate',
						rate: 2,
					},
					{
						title: 'Math.abs(p1 - p2) < rate',
						rate: 2,
					},
					{
						title: 'Math.abs(p1 - p2) < rate',
						rate: 2,
					},
					{
						title: 'Math.abs(p1 - p2) < rate',
						rate: 2,
					},
					{
						title: 'Math.abs(p1 - p2) < rate',
						rate: 2,
					},
					{
						title: 'Math.abs(p1 - p2) < rate',
						rate: 2,
					},
					{
						title: 'Math.abs(p1 - p2) < rate',
						rate: 2,
					},
				],
			})
			.then((response: null | IConf) => response && this.logger.debug(`Config migration in bd`));
	}

	@Post()
	async create(@Body() conf: IConf) {
		await this.confService.create(conf);
		this.logger.debug(`Create conf: ${conf}`);
	}

	@Get()
	async findAll(): Promise<IConf> {
		return this.confService.getDataByParam(1);
	}
}
