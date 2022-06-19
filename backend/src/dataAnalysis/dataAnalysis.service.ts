import {Injectable} from '@nestjs/common';
import {ConfService} from '../model/conf/conf.service';
import {FootballService} from '../model/football/football.service';
import {BetsSimulatorService} from '../betsSimulator/betsSimulator.service';
import {ScoreEvents} from '../parser/type/scoreEvents.type';
/*import {ParserFootballService} from '../parser/parserFootball.service';*/
import {StackType} from '../model/stack/type/stack.type';
import {MyLogger} from '../logger/myLogger.service';
import {Football} from '../model/football/schemas/football.schema';
import {Time} from '../model/conf/schemas/time.schema';

@Injectable()
export class DataAnalysisService {
	constructor(
		private readonly confService: ConfService,
		private readonly footballService: FootballService,
		private readonly betsSimulatorService: BetsSimulatorService,
		private readonly log: MyLogger,
	) {}

	/**
	 * Метод для выбора стратегии ставки.
	 *
	 * @param {Football} param объект события
	 * @param {(stackType: StackType, id: number) => void} incStack функция для добавления в стек
	 */
	public async strategyDefinition(
		param: Football,
		incStack: (stackType: StackType, id: number) => void,
	): Promise<void> {
		const {
			score: {sc1, sc2},
			time,
		} = param;

		let timeSetting: Time[] = await this.confService.getTime();

		if (sc1 + sc2 === 0) {
			if (time >= timeSetting[4].before && time <= timeSetting[4].after) {
				this.footballLiveStrategy(param, 4);
				await incStack(StackType.UNUSUAL, param.eventId);
			}
		}
	}

	/**
	 * Метод для повторной поверки матча и сохранения результата.
	 *
	 * @param {Football} param объект события
	 */

	/*public async reCheckStrategyDefinition(param: Football): Promise<void> {
		let {
			score: {sc1, sc2},
		} = param;
		this.log.debug(`re-check ${param.marketId}: Футбол - стратегия ${1}`);
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
	}*/

	/**
	 * Метод для поверки уникальности и сохранения результата матча.
	 *
	 * @param {ScoreEvents} scoreEvents объект события
	 */
	public setEvent(scoreEvents: ScoreEvents): Promise<void> {
		return this.footballService.setScoreByParam(scoreEvents).catch((error: any) => {
			this.log.error(DataAnalysisService.name, `Set rate: ${error}`);
			throw new Error(error);
		});
	}

	private footballLiveStrategy(param: Football, strategy: number = 1): void {
		this.saveEvent(param, strategy) // пропускает дальше если запись ушла в БД
			.then(async statistic => {
				if (statistic !== null) {
					this.log.debug(DataAnalysisService.name, `Найден ${param.marketId}: Футбол - стратегия ${strategy}`);
					await this.betsSimulatorService.matchRate(statistic);
				}
			})
			.catch(error => {
				this.log.error(DataAnalysisService.name, `footballLiveStrategy: ${error}`);
			});
	}

	/**
	 * Метод для поверки уникальности и сохранения отобранного матча.
	 *
	 * @param {Football} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	private saveEvent(param: Football, strategy: number): Promise<Football | null> {
		return this.footballService.create({...param, strategy}).catch((error: any) => {
			this.log.error(DataAnalysisService.name, `Save event rate: ${error}`);
			throw new Error(error);
		});
	}

	/**
	 * Метод для проверки матча в других стратегиях.
	 *
	 * @param {Football} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	/*private isEvent(param: Football, strategy: number): Promise<boolean> {
		return this.footballService.isMatch(param, strategy).catch((error: any) => {
			this.log.error(DataAnalysisService.name,`Is event rate: ${error}`);
			throw new Error(error);
		});
	}*/

	/**
	 * Метод для проверки матча в других стратегиях и вернуть объект.
	 *
	 * @param {Football} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	/*private getMatch(param: Football, strategy: number): Promise<Football | null> {
		return this.footballService.getMatch(param, strategy).catch((error: any) => {
			this.log.error(DataAnalysisService.name,`Get match rate: ${error}`);
			throw new Error(error);
		});
	}*/

	/**
	 * Метод для поверки уникальности и сохранения отобранного матча.
	 *
	 * @param {Football} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	/*private updateEvent(param: Football, strategy: number): Promise<Football | void> {
		return this.footballService.setDataByParam({...param, strategy}).catch((error: any) => {
			this.log.error(DataAnalysisService.name,`Update event rate: ${error}`);
			throw new Error(error);
		});
	}*/
}
