import {Injectable, Logger} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {ConfService} from '../model/conf/conf.service';
import {FootballService} from '../model/football/football.service';
import {BetsSimulatorService} from '../betsSimulator/betsSimulator.service';
import {ITime} from '../model/conf/type/conf.type';
import {ScoreEvents} from '../parser/type/scoreEvents.type';

@Injectable()
export class DataAnalysisService {
	private readonly logger = new Logger(DataAnalysisService.name);

	constructor(
		private readonly confService: ConfService,
		private readonly footballService: FootballService,
		private readonly betsSimulatorService: BetsSimulatorService,
	) {
	}

	/**
	 * Метод для выбора стратегии ставки.
	 *
	 * @param {IFootball} param объект события
	 * @param {(id: number) => void} incStack функция для получения событий которые удовлетворяют условиям
	 */
	public async strategyDefinition(param: IFootball, incStack: (id: number) => void): Promise<void> {
		let {
			score: {sc1, sc2},
			time
		} = param;
		let timeSetting: ITime[] = await this.confService.getTime();
		if ((sc1 + sc2) === 0) {
			/*if ((time >= timeSetting[1].before) && (time <= timeSetting[1].after)) {
				this.footballLiveStrategy(param, 1);
				await incStack(param.eventId);
			}*/
			if ((time >= timeSetting[2].before) && (time <= timeSetting[2].after)) {
				this.footballLiveStrategy(param, 2);
				await incStack(param.eventId);
			}
			if (time === timeSetting[3].before) {
				this.footballLiveStrategy(param, 3);
				await incStack(param.eventId);
			}
		}
		if ((sc1 + sc2) === 1) {
			this.footballLiveStrategy(param, 4);
			await incStack(param.eventId);
			if ((time >= timeSetting[4].before) && (time <= timeSetting[4].after)) {
				this.footballLiveStrategy(param, 4);
				await incStack(param.eventId);
			}
		}
		if (sc1 === sc2) {
			if ((time >= timeSetting[5].before) && (time <= timeSetting[5].after)) {
				if (param.rates.matchOdds.against.x < 2) {
					this.footballLiveStrategy(param, 5);
					await incStack(param.eventId);
				}
			}
		}
	}

	/**
	 * Метод для поверки уникальности и сохранения результата матча.
	 *
	 * @param {ScoreEvents} scoreEvents объект события
	 */
	public setEvent(scoreEvents: ScoreEvents): Promise<void> {
		return this.footballService.setScoreByParam(scoreEvents)
			.catch((error: any) => {
				this.logger.error(`Set rate: ${error}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для записа в базу отобранного матча есил его уже там нет.
	 *
	 * @param {IFootball} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	private footballLiveStrategy(param: IFootball, strategy: number = 1): void {
		this.saveEvent(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					this.logger.debug(`Найден ${param.eventId}: Футбол - стратегия ${strategy}`);
					await this.betsSimulatorService.matchRate(statistic);
				}
			})
			.catch((error) => {
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
		return this.footballService.create({...param, strategy})
			.catch((error: any) => {
				this.logger.error(`Save event rate: ${error}`);
				throw new Error(error);
			});
	}
}