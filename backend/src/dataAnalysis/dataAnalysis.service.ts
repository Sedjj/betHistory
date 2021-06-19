import {Injectable, Logger} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {ConfService} from '../model/conf/conf.service';
import {FootballService} from '../model/football/football.service';
import {BetsSimulatorService} from '../betsSimulator/betsSimulator.service';
import {ITime} from '../model/conf/type/conf.type';
import {ScoreEvents} from '../parser/type/scoreEvents.type';
import {ParserFootballService} from '../parser/parserFootball.service';
import {StackType} from '../model/stack/type/stack.type';

@Injectable()
export class DataAnalysisService {
	private readonly logger = new Logger(DataAnalysisService.name);

	constructor(
		private readonly confService: ConfService,
		private readonly footballService: FootballService,
		private readonly betsSimulatorService: BetsSimulatorService,
	) {}

	/**
	 * Метод для выбора стратегии ставки.
	 *
	 * @param {IFootball} param объект события
	 * @param {(stackType: StackType, id: number) => void} incStack функция для добавления в стек
	 * @param {(id: number) => void} addQueueWithDelay функция для добавления в стек
	 */
	public async strategyDefinition(
		param: IFootball,
		incStack: (stackType: StackType, id: number) => void,
		addQueueWithDelay: (id: number) => void,
	): Promise<void> {
		const {
			score: {sc1, sc2},
			time,
		} = param;

		let timeSetting: ITime[] = await this.confService.getTime();
		if (sc1 + sc2 === 1) {
			if (time >= timeSetting[1].before && time <= timeSetting[1].after) {
				this.footballLiveStrategy(param, 1);
				await incStack(StackType.USUALLY, param.eventId);
				// await addQueueWithDelay(param.eventId);
			}
			if (time >= timeSetting[2].before && time <= timeSetting[2].after) {
				if (await this.isEvent(param, 1)) {
					this.footballLiveStrategy(param, 2);
					await incStack(StackType.USUALLY, param.eventId);
				}
			}
			/*if (time >= timeSetting[3].before && time <= timeSetting[3].after) {
				if (await this.isEvent(param, 1)) {
					this.footballLiveStrategy(param, 3);
					await incStack(StackType.USUALLY, param.eventId);
				}
			}*/
		}
		if (sc1 + sc2 === 0) {
			if (time >= timeSetting[4].before && time <= timeSetting[4].after) {
				this.footballLiveStrategy(param, 4);
				await incStack(StackType.USUALLY, param.eventId);
			}
		}
		if (sc1 + sc2 === 1) {
			if (time >= timeSetting[5].before && time <= timeSetting[5].after) {
				const match = await this.getMatch(param, 4);
				if (match) {
					const {
						rates: {
							matchOdds: {
								p2: {behind: matchOddsP2},
								x: {behind: matchOddsX},
							},
							overUnder25: {totalMatched},
							overUnder15: {
								over: {against: TB15A},
							},
						},
						cards: {
							one: {corners: cornersOne},
							two: {corners: cornersTwo},
						},
						command: {youth, women},
					} = match;
					if (women === 0 && youth === 0) {
						if (cornersTwo < 2 && cornersOne < 4) {
							if (1.6 <= TB15A && TB15A <= 2.4) {
								if (matchOddsP2 > 2 && matchOddsX < 3.1) {
									if (totalMatched > 300) {
										this.footballLiveStrategy(param, 5);
										await incStack(StackType.USUALLY, param.eventId);
									}
								}
							}
						}
					}
				}
			}
			if (time >= timeSetting[6].before && time <= timeSetting[6].after) {
				const match = await this.getMatch(param, 5);
				if (match) {
					const {time: timeOldMatch} = match;
					const timeSpentIn5 = timeOldMatch + 2;
					if (time === timeSpentIn5) {
						this.footballLiveStrategy(param, 6);
						await incStack(StackType.USUALLY, param.eventId);
					}
				}
			}
		}
	}

	/**
	 * Метод для повторной поверки матча и сохранения результата.
	 *
	 * @param {IFootball} param объект события
	 */
	public async reCheckStrategyDefinition(param: IFootball): Promise<void> {
		let {
			score: {sc1, sc2},
		} = param;
		this.logger.debug(`re-check ${param.marketId}: Футбол - стратегия ${1}`);
		if (sc1 + sc2 === 1) {
			await this.updateEvent(param, 1);
		} else {
			await this.updateEvent(
				{
					...param,
					rates: ParserFootballService.initRates(1),
				},
				1,
			);
		}
	}

	/**
	 * Метод для поверки уникальности и сохранения результата матча.
	 *
	 * @param {ScoreEvents} scoreEvents объект события
	 */
	public setEvent(scoreEvents: ScoreEvents): Promise<void> {
		return this.footballService.setScoreByParam(scoreEvents).catch((error: any) => {
			this.logger.error(`Set rate: ${error}`);
			throw new Error(error);
		});
	}

	/**
	 * Метод для записи в базу отобранного матча если его уже там нет.
	 *
	 * @param {IFootball} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	private footballLiveStrategy(param: IFootball, strategy: number = 1): void {
		this.saveEvent(param, strategy) // пропускает дальше если запись ушла в БД
			.then(async statistic => {
				if (statistic !== null) {
					this.logger.debug(`Найден ${param.marketId}: Футбол - стратегия ${strategy}`);
					await this.betsSimulatorService.matchRate(statistic);
				}
			})
			.catch(error => {
				this.logger.error(`footballLiveStrategy: ${error}`);
			});
	}

	/**
	 * Метод для поверки уникальности и сохранения отобранного матча.
	 *
	 * @param {IFootball} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	private saveEvent(param: IFootball, strategy: number): Promise<IFootball | null> {
		return this.footballService.create({...param, strategy}).catch((error: any) => {
			this.logger.error(`Save event rate: ${error}`);
			throw new Error(error);
		});
	}

	/**
	 * Метод для проверки матча в других стратегиях.
	 *
	 * @param {IFootball} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	private isEvent(param: IFootball, strategy: number): Promise<boolean> {
		return this.footballService.isMatch(param, strategy).catch((error: any) => {
			this.logger.error(`Is event rate: ${error}`);
			throw new Error(error);
		});
	}

	/**
	 * Метод для проверки матча в других стратегиях и вернуть объект.
	 *
	 * @param {IFootball} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	private getMatch(param: IFootball, strategy: number): Promise<IFootball | null> {
		return this.footballService.getMatch(param, strategy).catch((error: any) => {
			this.logger.error(`Get match rate: ${error}`);
			throw new Error(error);
		});
	}

	/**
	 * Метод для поверки уникальности и сохранения отобранного матча.
	 *
	 * @param {IFootball} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	private updateEvent(param: IFootball, strategy: number): Promise<IFootball | void> {
		return this.footballService.setDataByParam({...param, strategy}).catch((error: any) => {
			this.logger.error(`Update event rate: ${error}`);
			throw new Error(error);
		});
	}
}
