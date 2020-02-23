import {Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {IFootball, IFootballModel, IFootballQuery} from './type/football.type';
import {log} from '../utils/logger';
import {mapProps} from '../utils/statisticHelpers';

@Injectable()
export class FootballService {
	constructor(
		@InjectModel('Football') private readonly footballModel: Model<IFootballModel>
	) {
	}

	/**
	 * Создание новой записи в таблице.
	 *
	 * @param {IFootball} param для таблицы
	 * @returns {Promise<IFootball | null>}
	 */
	async create(param: IFootball): Promise<IFootball | null> {
		let findMatch  = await this.footballModel.find({
			eventId: param.eventId,
			strategy: param.strategy
		}).exec();
		if (findMatch.length) {
			return Promise.resolve(null);
		}
		let createdFootball = new this.footballModel(param);
		return await createdFootball.save();
	}

	/**
	 * Получить записи из таблицы статистика.
	 *
	 * @param {IFootballQuery} param для таблицы.
	 * @returns {Promise<IFootball[]>}
	 */
	async getDataByParam(param?: IFootballQuery): Promise<IFootball[]> {
		return await this.footballModel.find(param != null ? param : {})
			.read('secondary')
			.exec()
			.then((statistics: any) => {
				if (!statistics) {
					log.error('StatisticNotFound Statistic with  not found');
					return [];
				}
				return statistics
					.map((statistic: any, index: number) => {
						let props = mapProps(statistic, index + 1);
						props['displayScore'] = props.score.sc1 + ':' + props.score.sc2;
						props['typeMatch'] = (props.command.women + props.command.youth) > 0 ? 1 : 0;
						return props;
					});
			})
			.catch((error: any) => {
				log.error(`Error getDataByParam param=${JSON.stringify(JSON.stringify(param))}: ${error.message}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для удаления записи в таблице.
	 *
	 * @param {IFootballQuery} param для таблицы
	 * @returns {Promise<void | IFootball | null>}
	 */
	async deleteDataByParam(param: IFootballQuery): Promise<void | IFootball | null> {
		return await this.footballModel
			.findOneAndRemove({matchId: param.matchId, strategy: param.strategy})
			.exec()
			.catch((error: any) => {
				log.error(`deleteStatistic param=${JSON.stringify(param)}: ${error.message}`);
			});
	}

	/**
	 * Редактирование записи в таблице.
	 *
	 * @param {IFootballQuery} param для таблицы
	 * @returns {Promise<any>}
	 */
	async setDataByParam(param: IFootball): Promise<IFootball> {
		return await this.footballModel
			.findOne({matchId: param.eventId, strategy: param.strategy})
			.read('secondary')
			.exec()
			.then((statistic: any) => {
				if (param.score && (param.score.resulting !== undefined)) {
					statistic.score.resulting = param.score.resulting;
				}
				if (param.rates !== undefined) {
					statistic.rate = param.rates;
				}
				if (param.modifiedBy !== undefined) {
					statistic.modifiedBy = param.modifiedBy;
				}
				return statistic.save();
			})
			.catch((error: any) => {
				log.error(`Error setDataByParam param=${JSON.stringify(param)}: ${error.message}`);
				throw new Error(error);
			});
	}
}
