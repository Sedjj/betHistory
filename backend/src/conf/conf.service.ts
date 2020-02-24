import {Injectable, Logger} from '@nestjs/common';
import {IConf, IConfModel, IRateStrategy, ITime} from './type/conf.type';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {dateStringToShortDateString} from '../utils/dateFormat';

@Injectable()
export class ConfService {
	private readonly logger = new Logger(ConfService.name);

	constructor(
		@InjectModel('Conf') private readonly confModel: Model<IConfModel>
	) {
	}

	/**
	 * Создание новой записи в таблице.
	 *
	 * @param {IConf} param для таблицы
	 * @returns {Promise<IConf | null>}
	 */
	async create(param: IConf) {
		let findMatch = await this.confModel.find({
			confId: param.confId
		}).exec();
		if (findMatch.length) {
			return Promise.resolve(null);
		}
		let createdFootball = new this.confModel(param);
		return await createdFootball.save()
			.then((model: IConfModel) => {
				this.logger.debug('Configuration model created');
				return model;
			});
	}

	async getDataByParam(confId: number): Promise<IConf> {
		return await this.confModel.find({confId})
			.read('secondary')
			.exec()
			.then((model: any) => {
				if (!model) {
					this.logger.error('Conf with not found');
					return [];
				}
				return model.map((x: any) => this.mapProps(x));
			})
			.catch((error: any) => {
				this.logger.error(`Error getDataByParam confId=${confId}: ${error.message}`);
				throw new Error(error);
			});
	}

	async setDataByParam(param: IConf): Promise<IConf> {
		return await this.confModel.findOne({confId: param.confId})
			.read('secondary')
			.exec()
			.then((model: IConfModel) => {
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
				return model.save().then((x) => this.mapProps(x));
			})
			.catch((error: any) => {
				this.logger.error(`Error setDataByParam param=${JSON.stringify(param)}: ${error.message}`);
				throw new Error(error);
			});
	}

	getTypeRate(strategy: number): number {
		return [
			1.5,
			1.5,
			2
		][strategy - 1];
	}

	getRateStrategy(strategy: number): IRateStrategy {
		return [
			{
				title: 'Math.abs(p1 - p2) < rate',
				rate: 2
			},
			{
				title: 'Math.abs(p1 - p2) < rate',
				rate: 2
			},
			{
				title: 'Math.abs(p1 - p2) < rate',
				rate: 2
			},
			{
				title: 'Math.abs(p1 - p2) < rate',
				rate: 2
			},
		][strategy - 1];
	}

	getTime(strategy: number): ITime {
		return [
			{
				before: 0,
				after: 0
			},
			{
				before: 5,
				after: 10
			},
			{
				before: 30,
				after: 35
			},
			{
				before: 45,
				after: 45
			},
			{
				before: 20,
				after: 45
			},
		][strategy - 1];
	}

	/**
	 * Преобразовывает статистику в необходимый формат
	 *
	 * @param {IConfModel} model статистика
	 * @return {IConf}
	 */
	mapProps(model: IConfModel): IConf {
		return {
			confId: model.confId,
			betAmount: model.betAmount,
			time: model.time,
			typeRate: model.typeRate,
			rate: model.rate,
			createdBy: dateStringToShortDateString(model.createdBy),
			modifiedBy: dateStringToShortDateString(model.modifiedBy)
		};
	}
}