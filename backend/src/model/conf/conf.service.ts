import {Injectable, Logger} from '@nestjs/common';
import {IConf, IConfModel, IRateStrategy, ITime} from './type/conf.type';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {dateStringToShortDateString} from '../../utils/dateFormat';

@Injectable()
export class ConfService {
	private readonly logger = new Logger(ConfService.name);

	constructor(@InjectModel('Config') private readonly confModel: Model<IConfModel>) {}

	/**
	 * Преобразовывает конфигурацию в необходимый формат
	 *
	 * @param {IConfModel} model статистика
	 *
	 * @return {IConf}
	 */
	private static mapProps(model: IConfModel): IConf {
		return {
			confId: model.confId,
			betAmount: model.betAmount,
			time: model.time,
			typeRate: model.typeRate,
			rate: model.rate,
			createdBy: model.createdBy ? dateStringToShortDateString(model.createdBy) : undefined,
			modifiedBy: model.modifiedBy ? dateStringToShortDateString(model.modifiedBy) : undefined,
		};
	}

	/**
	 * Создание новой записи в таблице.
	 *
	 * @param {IConf} param для таблицы
	 * @returns {Promise<IConf | null>}
	 */
	async create(param: IConf): Promise<null | IConf> {
		let findMatch = await this.confModel
			.find({
				confId: param.confId,
			})
			.exec();
		if (findMatch.length) {
			return Promise.resolve(null);
		}
		let createdConfig = new this.confModel(param);
		return await createdConfig
			.save()
			.then((model: IConfModel) => {
				this.logger.debug('Configuration model created');
				return ConfService.mapProps(model);
			})
			.catch((error: any) => {
				this.logger.error(`Error create conf param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для получения настроек конфигурации.
	 *
	 * @param {Number} confId id объекта конфига
	 */
	async getDataByParam(confId: number): Promise<IConf> {
		return await this.confModel
			.findOne({confId})
			.read('secondary')
			.exec()
			.then((model: IConfModel | null) => {
				if (!model) {
					this.logger.error('Conf with not found');
					throw new Error(`Conf with not found: ${confId}`);
				}
				return ConfService.mapProps(model);
			})
			.catch((error: any) => {
				this.logger.error(`Error getDataByParam confId=${confId}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для изменения конфигурации.
	 *
	 * @param {IConf} param параметры которые нужно поменять
	 */
	async setDataByParam(param: IConf): Promise<IConf | null> {
		return await this.confModel
			.findOne({confId: param.confId})
			.read('secondary')
			.exec()
			.then((model: IConfModel | null) => {
				if (!model) {
					this.logger.error('Conf with not found');
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
				return model.save().then((x: IConfModel) => ConfService.mapProps(x));
			})
			.catch((error: any) => {
				this.logger.error(`Error set data by param conf param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}

	getTypeRate(strategy: number): Promise<number> {
		return this.getDataByParam(1).then((model: IConf) => {
			return model.typeRate[strategy - 1];
		});
	}

	getRateStrategy(strategy: number): Promise<IRateStrategy> {
		return this.getDataByParam(1).then((model: IConf) => {
			return model.rate[strategy - 1];
		});
	}

	getTime(): Promise<ITime[]> {
		return this.getDataByParam(1).then((model: IConf) => {
			return model.time;
		});
	}
}
