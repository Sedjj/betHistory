import {Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {IFootball, IFootballQuery} from './interfaces/football.interface';
import {CreateFootballDto} from './dto/create-football.dto';
import {log} from '../utils/logger';
import {mapProps} from '../utils/statisticHelpers';

@Injectable()
export class FootballService {
	constructor(
		@InjectModel('Football') private readonly footballModel: Model<IFootball>
	) {
	}

	/**
	 * Создание новой записи в таблице.
	 *
	 * @param {CreateFootballDto} createFootballDto для таблицы
	 * @returns {Promise<IFootball | null>}
	 */
	async create(createFootballDto: CreateFootballDto): Promise<IFootball | null> {
		const findMatch  = await this.footballModel.find({
			matchId: createFootballDto.matchId,
			strategy: createFootballDto.strategy
		}).exec();
		if (findMatch.length) {
			return Promise.resolve(null);
		}
		const createdFootball = new this.footballModel(createFootballDto);
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
						const props = mapProps(statistic, index + 1);
						props['displayScore'] = props.score.sc1 + ':' + props.score.sc2;
						props['typeMatch'] = (props.command.women + props.command.youth) > 0 ? 1 : 0;
						return props;
					});
			})
			.catch((error: any) => {
				log.error(`getStatistic param=${JSON.stringify(JSON.stringify(param))}: ${error.message}`);
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
	async setDataByParam(param: IFootball): Promise<void | IFootball | null> {
		return await this.footballModel
			.findOne({matchId: param.matchId, strategy: param.strategy})
			.read('secondary')
			.exec()
			.then((statistic: any) => {
				if (param.rates && (param.rates.index !== undefined)) {
					statistic.rates.index = param.rates.index;
				}
				if (param.score && (param.score.resulting !== undefined)) {
					statistic.score.resulting = param.score.resulting;
				}
				if (param.rates !== undefined) {
					statistic.rate = param.rates;
				}
				if (param.cards !== undefined) {
					statistic.cards = param.cards;
				}
				if (param.modifiedBy !== undefined) {
					statistic.modifiedBy = param.modifiedBy;
				}
				return statistic.save();
			})
			.catch((error: any) => {
				log.error(`Error setStatistic param=${JSON.stringify(param)}: ${error.message}`);
				throw new Error(error);
			});
	}
}
