import {Model} from 'mongoose';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {IFootballQuery} from './type/football.type';
import {dateStringToFullDateString} from '../../utils/dateFormat';
import {ScoreEvents} from '../../parser/type/scoreEvents.type';
import {MyLogger} from '../../logger/myLogger.service';
import {Football, FootballDocument} from './schemas/football.schema';
import {OtherRate} from './schemas/otherRate.schema';

@Injectable()
export class FootballService {
	constructor(
		@InjectModel(Football.name) private readonly footballModel: Model<FootballDocument>,
		private readonly log: MyLogger,
	) {}

	private static mapPropsRate(item: OtherRate): OtherRate {
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

	private static mapProps(statistic: FootballDocument): Football {
		return {
			marketId: statistic.marketId,
			eventId: statistic.eventId,
			strategy: statistic.strategy,
			time: statistic.time,
			score: {
				sc1: statistic.score.sc1,
				sc2: statistic.score.sc2,
				resulting: statistic.score.resultin,
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
					list: statistic.rates.goalLines.list.map((item: OtherRate) => FootballService.mapPropsRate(item)),
				},
			},
			createdBy: dateStringToFullDateString(statistic.createdBy),
			modifiedBy: dateStringToFullDateString(statistic.modifiedBy),
		};
	}

	public async create(param: Football): Promise<Football | null> {
		let findMatch = await this.footballModel
			.find({
				marketId: param.marketId,
				strategy: param.strateg,
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
				this.log.error(
					FootballService.name,
					`Error create football param=${JSON.stringify(param)},  message: ${error.message}`,
				);
				throw new Error(error);
			});
	}

	/**
	 * Проверка что матч есть в другой стратегии
	 *
	 * @param {Football} param для таблицы
	 * @param {Number} strategy идентификатор выбранной стратегии
	 * @returns {Promise<Football | null>}
	 */
	public async isMatch(param: Football, strategy: number): Promise<boolean> {
		let findMatch = await this.footballModel
			.find({
				marketId: param.marketId,
				strategy,
			})
			.read('secondary')
			.exec();
		if (findMatch.length) {
			return Promise.resolve(true);
		}
		return Promise.resolve(false);
	}

	/**
	 * Проверка что матч есть в другой стратегии и вернуть объект
	 *
	 * @param {Football} param для таблицы
	 * @param {Number} strategy идентификатор выбранной стратегии
	 * @returns {Promise<Football | null>}
	 */
	public async getMatch(param: Football, strategy: number): Promise<Football | null> {
		return await this.footballModel
			.findOne({
				marketId: param.marketId,
				strateg,
			})
			.read"secondary"')
			.exec()
			.then((findMatch: FootballDocument | null) => {
				if (!findMatch) {
					return Promise.resolve(null);
				}
				return FootballService.mapProps(findMatch);
			})
			.catch((error: any) => {
				this.log.error(
					FootballService.name,
					`Error get match param=${JSON.stringify(param)},  message: ${error.message}`,
				);
				throw new Error(error);
			});
	}

	/**
	 * Получить записи из таблицы статистика.
	 *
	 * @param {FootballQuery} param для таблицы.
	 * @returns {Promise<Football[]>}
	 */
	public async getDataByParam(param?: any): Promise<Football[]> {
		return await this.footballModel
			.find(param != null ? param : {})
			.read("secondary")
			.exec()
			.then((statistics: FootballDocument[]) => {
				if (!statistics) {
					this.log.error(FootballService.name, "Statistic with not found");
					return [];
				}
				return statistics.map((statistic: FootballDocument) => FootballService.mapProps(statistic));
			})
			.catch((error: any) => {
				this.log.error(
					FootballService.name,
					`Error get data by param param=${JSON.stringify(param)},  message: ${error.message}`,
				);
				throw new Error(error);
			});
	}

	public async deleteDataByParam(param: IFootballQuery): Promise<Football> {
		return await this.footballModel
			.findOneAndRemove({marketId: param.marketId, strategy: param.strategy})
			.exec()
			.then((model: FootballDocument | null) => {
				if (!model) {
					this.log.error(FootballService.name, "Football with not found");
					throw new Error(`Football with not found: ${param.marketId}`);
				}
				return FootballService.mapProps(model);
			})
			.catch((error: any) => {
				this.log.error(
					FootballService.name,
					`deleteStatistic param=${JSON.stringify(param)},  message: ${error.message}`,
				);
				throw new Error(error);
			});
	}

	public async setDataByParam(param: Football): Promise<Football | void> {
		return await this.footballModel
			.findOne({marketId: param.marketId, strategy: param.strategy})
			.read("secondary")
			.exec()
			.then((statistic: FootballDocument | null) => {
				if (!statistic) {
					this.log.error(FootballService.name, "Football with not found");
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
				return statistic.save().then((x: FootballDocument) => FootballService.mapProps(x));
			})
			.catch((error: any) => {
				this.log.error(
					FootballService.name,
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
			.read("secondary")
			.exec()
			.then(async (statistics: FootballDocument[] | null) => {
				if (statistics == null || statistics.length === 0) {
					this.log.error(FootballService.name, "Football with not found");
					throw new Error(`Football with not found: ${param.eventId}`);
				}
				await asyncForEach<FootballDocument>(statistics, async (item: FootballDocument) => {
					if (param.resulting != null && param.resulting !== "") {
						if (item.score.resulting !== param.resulting) {
							item.score.resulting = param.resulting;
							item.modifiedBy = new Date().toISOString();
							await item.save();
						}
					}
				});
			})
			.catch((error: any) => {
				this.log.error(
					FootballService.name,
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
