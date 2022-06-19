import { Body, Controller, Get, OnApplicationBootstrap, Post } from "@nestjs/common";
import { ConfService } from "./conf.service";
import { MyLogger } from "../../logger/myLogger.service";
import { Config } from "./schemas/config.schema";

@Controller("conf")
export class ConfController implements OnApplicationBootstrap {
	constructor(private readonly confService: ConfService, private readonly log: MyLogger) {
	}

	onApplicationBootstrap() {
		this.confService
			.create({
				confId: 1,
				betAmount: 1,
				time: [
					{
						before: 0,
						after: 0
					},
					{
						// 1
						before: 15,
						after: 18,
					},
					{
						// 2
						before: 20,
						after: 21,
					},
					{
						// 3
						before: 30,
						after: 35,
					},
					{
						// 4
						before: 35,
						after: 38,
					},
					{
						// 5
						before: 38,
						after: 70,
					},
					{
						// 6
						before: 40,
						after: 72,
					},
				],
				typeRate: [1.5, 1.5, 1.5, 0.5, 0.5, 0.5, 0.5],
				rate: [
					{
						title: 'Math.abs(p1 - p2) < rate',
						rate: 2,
					},
					{
						title: "Math.abs(p1 - p2) < rate",
						rate: 2
					},
					{
						title: "Math.abs(p1 - p2) < rate",
						rate: 2
					},
					{
						title: "Math.abs(p1 - p2) < rate",
						rate: 2
					},
					{
						title: "Math.abs(p1 - p2) < rate",
						rate: 2
					},
					{
						title: "Math.abs(p1 - p2) < rate",
						rate: 2
					},
					{
						title: "Math.abs(p1 - p2) < rate",
						rate: 2
					}
				],
			})
			.then((response: null | Config) => response && this.log.debug(ConfController.name, `Config migration in bd`));
	}

	@Post()
	async create(@Body() conf: Config) {
		await this.confService.create(conf);
		this.log.debug(ConfController.name, `Create conf: ${conf}`);
	}

	@Get()
	async findAll(): Promise<Config> {
		return this.confService.getDataByParam(1);
	}
}
