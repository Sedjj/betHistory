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
			over: {
				selectionId: item.over.selectionId,
				handicap: item.over.handicap,
				behind: item.over.behind,
				against: item.over.against,
			},
			under: {
				selectionId: item.under.selectionId,
				handicap: item.under.handicap,
				behind: item.under.behind,
				against: item.under.against,
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
					marketId: statistic.rates.matchOdds.marketId,
					status: statistic.rates.matchOdds.status,
					totalMatched: statistic.rates.matchOdds.totalMatched,
					p1: {
						selectionId: statistic.rates.matchOdds.p1.selectionId,
						handicap: statistic.rates.matchOdds.p1.handicap,
						behind: statistic.rates.matchOdds.p1.behind,
						against: statistic.rates.matchOdds.p1.against,
					},
					x: {
						selectionId: statistic.rates.matchOdds.x.selectionId,
						handicap: statistic.rates.matchOdds.x.handicap,
						behind: statistic.rates.matchOdds.x.behind,
						against: statistic.rates.matchOdds.x.against,
					},
					p2: {
						selectionId: statistic.rates.matchOdds.p2.selectionId,
						handicap: statistic.rates.matchOdds.p2.handicap,
						behind: statistic.rates.matchOdds.p2.behind,
						against: statistic.rates.matchOdds.p2.against,
					},
					mod: {
						selectionId: statistic.rates.matchOdds.mod.selectionId,
						handicap: statistic.rates.matchOdds.mod.handicap,
						behind: statistic.rates.matchOdds.mod.behind,
						against: statistic.rates.matchOdds.mod.against,
					},
				},
				overUnder15: {
					marketId: statistic.rates.overUnder15.marketId,
					status: statistic.rates.overUnder15.status,
					totalMatched: statistic.rates.overUnder15.totalMatched,
					...FootballService.mapPropsRate(statistic.rates.overUnder15),
				},
				overUnder25: {
					marketId: statistic.rates.overUnder25.marketId,
					status: statistic.rates.overUnder25.status,
					totalMatched: statistic.rates.overUnder25.totalMatched,
					...FootballService.mapPropsRate(statistic.rates.overUnder25),
				},
				bothTeamsToScore: {
					marketId: statistic.rates.bothTeamsToScore.marketId,
					status: statistic.rates.bothTeamsToScore.status,
					totalMatched: statistic.rates.bothTeamsToScore.totalMatched,
					yes: {
						selectionId: statistic.rates.bothTeamsToScore.yes.selectionId,
						handicap: statistic.rates.bothTeamsToScore.yes.handicap,
						behind: statistic.rates.bothTeamsToScore.yes.behind,
						against: statistic.rates.bothTeamsToScore.yes.against,
					},
					no: {
						selectionId: statistic.rates.bothTeamsToScore.no.selectionId,
						handicap: statistic.rates.bothTeamsToScore.no.handicap,
						behind: statistic.rates.bothTeamsToScore.no.behind,
						against: statistic.rates.bothTeamsToScore.no.against,
					},
				},
				goalLines: {
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
						if (item.score.resulting !== param.resulting) {
							item.score.resulting = param.resulting;
							await item.save();
						}
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
