import {Injectable, Logger} from '@nestjs/common';
/*import config from 'config';*/
import {IFootball} from '../football/type/football.type';
import {ConfService} from '../conf/conf.service';
import {IRateStrategy, ITime} from '../conf/type/conf.type';
import {FootballService} from '../football/football.service';
import {BetsSimulatorService} from '../betsSimulator/betsSimulator.service';

/*const urlFootballExpandedRate = config.get<string>('parser.football.expandedRate');*/

@Injectable()
export class DataAnalysisService {
	private readonly logger = new Logger(DataAnalysisService.name);

	constructor(
		private readonly confService: ConfService,
		private readonly footballService: FootballService,
		private readonly betsSimulatorService: BetsSimulatorService,
	) {
	}

	public async footballLiveStrategy(param: IFootball): Promise<void> {
		const {
			rates: {
				mainRates: {behind}
			}
		} = param;
		let time: ITime[] = this.confService.getTime();
		if ((behind.p1 != null) && (behind.p2 != null) && (behind.p1 !== 0) && (behind.p2 !== 0) && (behind.x != null)) {
			if ((param.score.sc1 + param.score.sc2) === 0) {
				if ((param.time >= time[1].before) && (param.time <= time[1].after)) {
					this.footballLiveStrategyOne(param);
				}
				if ((param.time >= time[2].before) && (param.time <= time[2].after)) {
					this.footballLiveStrategyTwo(param);
				}
				if (param.time === time[3].before) {
					this.footballLiveStrategyThree(param);
				}
			}
		}
	}

	private footballLiveStrategyOne(param: IFootball): void {
		const {
			rates: {
				mainRates: {behind}
			}
		} = param;
		const strategy: number = 1;
		let rateStrategy: IRateStrategy = this.confService.getRateStrategy(strategy);
		if (Math.abs(behind.p1 - behind.p2) < rateStrategy.rate) {
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
	}

	private footballLiveStrategyTwo(param: IFootball): void {
		const {
			rates: {
				mainRates: {behind}
			}
		} = param;
		const strategy: number = 1;
		let rateStrategy: IRateStrategy = this.confService.getRateStrategy(strategy);
		if (Math.abs(behind.p1 - behind.p2) < rateStrategy.rate) {
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
	}

	private footballLiveStrategyThree(param: IFootball): void {
		const {
			rates: {
				mainRates: {behind}
			}
		} = param;
		const strategy: number = 1;
		let rateStrategy: IRateStrategy = this.confService.getRateStrategy(strategy);
		if (Math.abs(behind.p1 - behind.p2) < rateStrategy.rate) {
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
	}

	private saveRate(param: IFootball, strategy: number): Promise<IFootball | null> {
		return this.footballService.create({...param, strategy})
			.catch((error: any) => {
				this.logger.error(`Save rate: ${error}`);
				throw new Error(error);
			});
	}
}