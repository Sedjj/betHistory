import {Model} from 'mongoose';
import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {IFootball, IFootballModel, IFootballQuery, IOtherRate} from './type/football.type';
import {dateStringToFullDateString} from '../../utils/dateFormat';
import {ScoreEvents} from '../../parser/type/scoreEvents.type';

@Injectable()
export class FootballService {
	private readonly logger = new Logger(FootballService.name);

	constructor(@InjectModel('Football') private readonly footballModel: Model<IFootballModel>) {}

	/**
	 * Преобразовывает ставки в необходимый формат
	 *
	 * @param {IOtherRate} item статистика
	 * @return {Object}
	 */
	private static mapPropsRate(item: IOtherRate): IOtherRate {
		return {
			handicap: item.handicap,
			behind: item.behind,
			against: item.against,
		};
	}

	/**
	 * Преобразовывает статистику в необходимый формат
	 *
	 * @param {IFootballModel} statistic статистика
	 * @return {Object}
	 */
	private static mapProps(statistic: IFootballModel): IFootball {
		return {
			marketId: statistic.marketId,
			eventId: statistic.eventId,
			strategy: statistic.strategy,
			time: statistic.time,
			score: {
				sc1: statistic.score.sc1,
				sc2: statistic.score.sc2,
				resulting: statistic.score.resulting,
			},
			command: {
				one: statistic.command.one,
				two: statistic.command.two,
				group: statistic.command.group,
				women: statistic.command.women,
				youth: statistic.command.youth,
				limited: statistic.command.limited,
			},
			cards: {
				one: {
					red: statistic.cards.one.red,
					yellow: statistic.cards.one.yellow,
					corners: statistic.cards.one.corners,
					attacks: statistic.cards.one.attacks,
					danAttacks: statistic.cards.one.danAttacks,
					shotsOn: statistic.cards.one.shotsOn,
					shotsOff: statistic.cards.one.shotsOff,
				},
				two: {
					red: statistic.cards.two.red,
					yellow: statistic.cards.two.yellow,
					corners: statistic.cards.two.corners,
					attacks: statistic.cards.two.attacks,
					danAttacks: statistic.cards.two.danAttacks,
					shotsOn: statistic.cards.two.shotsOn,
					shotsOff: statistic.cards.two.shotsOff,
				},
			},
			rates: {
				matchOdds: {
					selectionId: statistic.rates.matchOdds.selectionId,
					marketId: statistic.rates.matchOdds.marketId,
					status: statistic.rates.matchOdds.status,
					handicap: statistic.rates.matchOdds.handicap,
					behind: {
						p1: statistic.rates.matchOdds.behind.p1,
						x: statistic.rates.matchOdds.behind.x,
						p2: statistic.rates.matchOdds.behind.p2,
						mod: statistic.rates.matchOdds.behind.mod,
					},
					against: {
						p1: statistic.rates.matchOdds.against.p1,
						x: statistic.rates.matchOdds.against.x,
						p2: statistic.rates.matchOdds.against.p2,
						mod: statistic.rates.matchOdds.against.mod,
					},
				},
				under15: {
					selectionId: statistic.rates.under15.selectionId,
					marketId: statistic.rates.under15.marketId,
					status: statistic.rates.under15.status,
					handicap: statistic.rates.under15.handicap,
					behind: statistic.rates.under15.behind,
					against: statistic.rates.under15.against,
				},
				under25: {
					selectionId: statistic.rates.under25.selectionId,
					marketId: statistic.rates.under25.marketId,
					status: statistic.rates.under25.status,
					handicap: statistic.rates.under25.handicap,
					behind: statistic.rates.under25.behind,
					against: statistic.rates.under25.against,
				},
				bothTeamsToScoreYes: {
					selectionId: statistic.rates.bothTeamsToScoreYes.selectionId,
					marketId: statistic.rates.bothTeamsToScoreYes.marketId,
					status: statistic.rates.bothTeamsToScoreYes.status,
					handicap: statistic.rates.bothTeamsToScoreYes.handicap,
					behind: statistic.rates.bothTeamsToScoreYes.behind,
					against: statistic.rates.bothTeamsToScoreYes.against,
				},
				bothTeamsToScoreNo: {
					selectionId: statistic.rates.bothTeamsToScoreNo.selectionId,
					marketId: statistic.rates.bothTeamsToScoreNo.marketId,
					status: statistic.rates.bothTeamsToScoreNo.status,
					handicap: statistic.rates.bothTeamsToScoreNo.handicap,
					behind: statistic.rates.bothTeamsToScoreNo.behind,
					against: statistic.rates.bothTeamsToScoreNo.against,
				},
				allTotalGoals: {
					selectionId: statistic.rates.allTotalGoals.selectionId,
					marketId: statistic.rates.allTotalGoals.marketId,
					status: statistic.rates.allTotalGoals.status,
					list: statistic.rates.allTotalGoals.list.map((item: IOtherRate) => FootballService.mapPropsRate(item)),
				},
			},
			createdBy: dateStringToFullDateString(statistic.createdBy),
			modifiedBy: dateStringToFullDateString(statistic.modifiedBy),
		};
	}

	/**
	 * Создание новой записи в таблице.
	 *
	 * @param {IFootball} param для таблицы
	 * @returns {Promise<IFootball | null>}
	 */
	public async create(param: IFootball): Promise<IFootball | null> {
		let findMatch = await this.footballModel
			.find({
				marketId: param.marketId,
				strategy: param.strategy,
			})
			.exec();
		if (findMatch.length) {
			return Promise.resolve(null);
		}
		let createdFootball = new this.footballModel(param);
		return await createdFootball
			.save()
			.then(model => FootballService.mapProps(model))
			.catch((error: any) => {
				this.logger.error(`Error create football param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}

	/**
	 * Получить записи из таблицы статистика.
	 *
	 * @param {IFootballQuery} param для таблицы.
	 * @returns {Promise<IFootball[]>}
	 */
	public async getDataByParam(param?: any): Promise<IFootball[]> {
		return await this.footballModel
			.find(param != null ? param : {})
			.read('secondary')
			.exec()
			.then((statistics: IFootballModel[]) => {
				if (!statistics) {
					this.logger.error('Statistic with not found');
					return [];
				}
				return statistics.map((statistic: IFootballModel) => FootballService.mapProps(statistic));
			})
			.catch((error: any) => {
				this.logger.error(`Error getDataByParam param=${JSON.stringify(param)},  message: ${error.message}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для удаления записи в таблице.
	 *
	 * @param {IFootballQuery} param для таблицы
	 * @returns {Promise<void | IFootball | null>}
	 */
	public async deleteDataByParam(param: IFootballQuery): Promise<IFootball> {
		return await this.footballModel
			.findOneAndRemove({marketId: param.marketId, strategy: param.strategy})
			.exec()
			.then((model: IFootballModel | null) => {
				if (!model) {
					this.logger.error('Football with not found');
					throw new Error(`Football with not found: ${param.marketId}`);
				}
				return FootballService.mapProps(model);
			})
			.catch((error: any) => {
				this.logger.error(`deleteStatistic param=${JSON.stringify(param)},  message: ${error.message}`);
				throw new Error(error);
			});
	}

	/**
	 * Редактирование записи в таблице.
	 *
	 * @param {IFootballQuery} param для таблицы
	 * @returns {Promise<any>}
	 */
	public async setDataByParam(param: IFootball): Promise<IFootball | void> {
		return await this.footballModel
			.findOne({marketId: param.marketId, strategy: param.strategy})
			.read('secondary')
			.exec()
			.then((statistic: IFootballModel | null) => {
				if (!statistic) {
					this.logger.error('Football with not found');
					throw new Error(`Football with not found: ${param.eventId}`);
				}
				if (param.rates != null) {
					statistic.rates = param.rates;
				}
				if (param.cards != null) {
					statistic.cards = param.cards;
				}
				if (param.modifiedBy != null) {
					statistic.modifiedBy = param.modifiedBy;
				}
				return statistic.save().then((x: IFootballModel) => FootballService.mapProps(x));
			})
			.catch((error: any) => {
				this.logger.error(
					`Error set data by param football param=${JSON.stringify(param)},  message: ${error.message}`,
				);
				throw new Error(error);
			});
	}

	/**
	 * Редактирование результата события.
	 *
	 * @param {IFootballQuery} param для таблицы
	 * @returns {Promise<any>}
	 */
	public async setScoreByParam(param: ScoreEvents): Promise<void> {
		return await this.footballModel
			.find({marketId: param.marketId})
			.read('secondary')
			.exec()
			.then(async (statistics: IFootballModel[] | null) => {
				if (statistics == null || statistics.length === 0) {
					this.logger.error('Football with not found');
					throw new Error(`Football with not found: ${param.eventId}`);
				}
				await asyncForEach<IFootballModel>(statistics, async (item: IFootballModel) => {
					if (param.resulting != null && param.resulting !== '') {
						item.score.resulting = param.resulting;
						await item.save();
					}
				});
			})
			.catch((error: any) => {
				this.logger.error(
					`Error set score by param football param=${JSON.stringify(param)},  message: ${error.message}`,
				);
				throw new Error(error);
			});
	}
}

async function asyncForEach<T>(array: T[], callback: (item: T, index: number, array: T[]) => Promise<void>) {
	for (let index = 0; index < array.length; index++) {
		await callback(array[index], index, array);
	}
}
