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
			behind: {
				over: item.behind.over,
				under: item.behind.under,
			},
			against: {
				over: item.behind.over,
				under: item.behind.under,
			},
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
					totalMatched: statistic.rates.matchOdds.totalMatched,
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
				overUnder15: {
					selectionId: statistic.rates.overUnder15.selectionId,
					marketId: statistic.rates.overUnder15.marketId,
					status: statistic.rates.overUnder15.status,
					totalMatched: statistic.rates.overUnder15.totalMatched,
					handicap: statistic.rates.overUnder15.handicap,
					behind: {
						over: statistic.rates.overUnder15.behind.over,
						under: statistic.rates.overUnder15.behind.under,
					},
					against: {
						over: statistic.rates.overUnder15.against.over,
						under: statistic.rates.overUnder15.against.under,
					},
				},
				overUnder25: {
					selectionId: statistic.rates.overUnder25.selectionId,
					marketId: statistic.rates.overUnder25.marketId,
					status: statistic.rates.overUnder25.status,
					totalMatched: statistic.rates.overUnder25.totalMatched,
					handicap: statistic.rates.overUnder25.handicap,
					behind: {
						over: statistic.rates.overUnder25.behind.over,
						under: statistic.rates.overUnder25.behind.under,
					},
					against: {
						over: statistic.rates.overUnder25.against.over,
						under: statistic.rates.overUnder25.against.under,
					},
				},
				bothTeamsToScore: {
					selectionId: statistic.rates.bothTeamsToScore.selectionId,
					marketId: statistic.rates.bothTeamsToScore.marketId,
					status: statistic.rates.bothTeamsToScore.status,
					totalMatched: statistic.rates.bothTeamsToScore.totalMatched,
					handicap: statistic.rates.bothTeamsToScore.handicap,
					behind: {
						yes: statistic.rates.bothTeamsToScore.behind.yes,
						no: statistic.rates.bothTeamsToScore.behind.no,
					},
					against: {
						yes: statistic.rates.bothTeamsToScore.against.yes,
						no: statistic.rates.bothTeamsToScore.against.no,
					},
				},
				goalLines: {
					selectionId: statistic.rates.goalLines.selectionId,
					marketId: statistic.rates.goalLines.marketId,
					status: statistic.rates.goalLines.status,
					totalMatched: statistic.rates.goalLines.totalMatched,
					list: statistic.rates.goalLines.list.map((item: IOtherRate) => FootballService.mapPropsRate(item)),
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
