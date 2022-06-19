import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { dateStringToShortDateString } from "../../utils/dateFormat";
import { MyLogger } from "../../logger/myLogger.service";
import { ConfDocument, Config } from "./schemas/config.schema";
import { RateStrategy } from "./schemas/rateStrategy.schema";
import { Time } from "./schemas/time.schema";

@Injectable()
export class ConfService {
	constructor(@InjectModel(Config.name) private readonly confModel: Model<ConfDocument>, private readonly log: MyLogger) {
	}

	private static mapProps(model: ConfDocument): Config {
		return {
			confId: model.confId,
			betAmount: model.betAmount,
			time: model.time,
			typeRate: model.typeRate,
			rate: model.rate,
			createdBy: model.createdBy ? dateStringToShortDateString(model.createdBy) : undefined,
			modifiedBy: model.modifiedBy ? dateStringToShortDateString(model.modifiedBy) : undefined
		};
	}

	async create(param: Config): Promise<null | Config> {
		let findMatch = await this.confModel
			.find({
				confId: param.confId
			})
			.exec();
		if (findMatch.length) {
			return Promise.resolve(null);
		}
		let createdConfig = new this.confModel(param);
		return await createdConfig
			.save()
			.then((model: ConfDocument) => {
				this.log.debug(ConfService.name, "Configuration model created");
				return ConfService.mapProps(model);
			})
			.catch((error: any) => {
				this.log.error(ConfService.name, `Error create conf param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для получения настроек конфигурации.
	 *
	 * @param {Number} confId id объекта конфига
	 */
	async getDataByParam(confId: number): Promise<Config> {
		return await this.confModel
			.findOne({ confId })
			.read("secondary")
			.exec()
			.then((model: ConfDocument | null) => {
				if (!model) {
					this.log.error(ConfService.name, "Conf with not found");
					throw new Error(`Conf with not found: ${confId}`);
				}
				return ConfService.mapProps(model);
			})
			.catch((error: any) => {
				this.log.error(ConfService.name, `Error getDataByParam confId=${confId}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для изменения конфигурации.
	 *
	 * @param {Config} param параметры которые нужно поменять
	 */
	async setDataByParam(param: Config): Promise<Config | null> {
		return await this.confModel
			.findOne({ confId: param.confId })
			.read("secondary")
			.exec()
			.then((model: ConfDocument | null) => {
				if (!model) {
					this.log.error(ConfService.name, "Conf with not found");
					throw new Error(`Conf with not found: ${param.confId}`);
				}
				if (param.betAmount !== undefined) {
					model.betAmount = param.betAmount;
				}
				if (param.time !== undefined) {
					model.time = param.time;
				}
				if (param.typeRate !== undefined) {
					model.typeRate = param.typeRate;
				}
				if (param.rate !== undefined) {
					model.rate = param.rate;
				}
				if (param.modifiedBy !== undefined) {
					model.modifiedBy = param.modifiedBy;
				}
				return model.save().then((x: ConfDocument) => ConfService.mapProps(x));
			})
			.catch((error: any) => {
				this.log.error(ConfService.name, `Error set data by param conf param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}

	getTypeRate(strategy: number): Promise<number> {
		return this.getDataByParam(1).then((model: Config) => {
			return model.typeRate[strategy - 1];
		});
	}

	getRateStrategy(strategy: number): Promise<RateStrategy> {
		return this.getDataByParam(1).then((model: Config) => model.rate[strategy - 1]);
	}

	getTime(): Promise<Time[]> {
		return this.getDataByParam(1).then((model: Config) => model.time);
	}
}
