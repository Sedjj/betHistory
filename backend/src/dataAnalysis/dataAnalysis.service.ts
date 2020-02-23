import {Injectable, Logger} from '@nestjs/common';
import {IFootball} from '../football/type/football.type';
import {ConfService} from '../conf/conf.service';
import {FootballService} from '../football/football.service';
import {BetsSimulatorService} from '../betsSimulator/betsSimulator.service';

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
	 */
	public async strategyDefinition(param: IFootball): Promise<void> {
		let {getTime} = this.confService;
		let {
			score: {sc1, sc2},
			time
		} = param;
		if ((sc1 + sc2) === 0) {
			if ((time >= getTime(1).before) && (time <= getTime(1).after)) {
				this.footballLiveStrategy(param, 1);
			}
			if ((time >= getTime(2).before) && (time <= getTime(2).after)) {
				this.footballLiveStrategy(param, 2);
			}
			if (time === getTime(3).before) {
				this.footballLiveStrategy(param, 3);
			}
		}
		if ((sc1 + sc2) === 1) {
			if ((time >= getTime(4).before) && (time <= getTime(4).after)) {
				this.footballLiveStrategy(param, 4);
			}
		}
	}

	/**
	 * Метод для записа в базу отобранного матча есил его уже там нет.
	 *
	 * @param {IFootball} param объект события
	 * @param {Number} strategy идентификатор выбранной стратегии
	 */
	private footballLiveStrategy(param: IFootball, strategy: number = 1): void {
		this.saveRate(param, strategy)// пропускает дальше если запись ушла в БД
			.then(async (statistic) => {
				if (statistic !== null) {
					this.logger.debug(`Найден ${param.eventId}: Футбол - стратегия ${strategy}`);
					await this.betsSimulatorService.matchRate(statistic);
				}
			})
			.catch((error) => {
				this.logger.error(`footballLiveStrategyFour: ${error}`);
			});
	}

	private saveRate(param: IFootball, strategy: number): Promise<IFootball | null> {
		return this.footballService.create({...param, strategy})
			.catch((error: any) => {
				this.logger.error(`Save rate: ${error}`);
				throw new Error(error);
			});
	}

	/*private setRate(param: IFootball): Promise<IFootball> {
		return this.footballService.setDataByParam({
				...param,
				rates: param.rates,
				modifiedBy: new Date().toISOString()
			})
			.catch((error: any) => {
				this.logger.error(`Save rate: ${error}`);
				throw new Error(error);
			});
	}*/
}