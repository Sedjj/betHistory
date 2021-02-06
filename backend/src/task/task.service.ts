import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {FetchService} from '../parser/fetch.service';
import config from 'config';
import {ParserFootballService} from '../parser/parserFootball.service';
import {DataAnalysisService} from '../dataAnalysis/dataAnalysis.service';
import {IFootball} from '../model/football/type/football.type';
import {EventDetails} from '../parser/type/eventDetails.type';
import {LiteMarkets} from '../parser/type/marketsEvents.type';
import {MarketNodes} from '../parser/type/byMarket.type';
import {ScoreEvents} from '../parser/type/scoreEvents.type';
import {QueueProcessor} from './queue/queue.processor';
import {StackService} from './stack/stack.service';
import {StackType} from '../model/stack/type/stack.type';
/*import {QueueService} from './queue/queue.service';*/

const urlSearch = config.get<string>('parser.football.search');
const urlEventDetails = config.get<string>('parser.football.eventDetails');
const urlMarketsEvents = config.get<string>('parser.football.marketsEvents');
const urlByMarket = config.get<string>('parser.football.byMarket');

@Injectable()
export class TaskService implements OnApplicationBootstrap {
	private readonly logger = new Logger(TaskService.name);

	constructor(
		private fetchService: FetchService,
		private parserFootballService: ParserFootballService,
		private dataAnalysisService: DataAnalysisService,
		private readonly stackService: StackService,
		private readonly queueProcessor: QueueProcessor /*private readonly queueService: QueueService,*/,
	) {}

	async onApplicationBootstrap() {
		this.logger.debug('****start scheduler search football****');
		this.logger.debug('****start scheduler checking results****');
	}

	@Cron(process.env.NODE_ENV === 'development' ? '*/30 * * * * *' : '*/01 * * * *')
	public async searchFootball() {
		let activeEvents: number[] = await this.getActiveEventIds();
		if (activeEvents.length) {
			let eventDetails: EventDetails[] = await this.getEventDetailsForEvents(activeEvents);
			eventDetails.forEach((item: EventDetails) => {
				try {
					let param: IFootball = this.parserFootballService.getParams(item);
					this.dataAnalysisService.strategyDefinition(
						param,
						// tslint:disable-next-line:no-empty
						this.stackService.increaseActiveEventId,
						// tslint:disable-next-line:no-empty
						() => {},
						/*this.queueService.addQueueWithDelay,*/
					);
				} catch (error) {
					this.logger.debug(`Ошибка при parser события: ${JSON.stringify(item)} error: ${error}`);
				}
			});
		}
	}

	// @Cron(process.env.NODE_ENV === 'development' ? '*/10 * * * * *' : '*/05 * * * * *')
	public async reCheckMatch() {
		if (this.queueProcessor.getLengthEvent()) {
			const ids = this.queueProcessor.getEventIds();
			let eventDetails: EventDetails[] = await this.fetchService.getEventDetails(
				urlEventDetails.replace('${id}', this.queueProcessor.getStringEventIds()),
			);
			this.queueProcessor.decreaseEventId(ids);

			eventDetails.forEach((item: EventDetails) => {
				try {
					let param: IFootball = this.parserFootballService.getParams(item);
					this.dataAnalysisService.reCheckStrategyDefinition(param);
				} catch (error) {
					this.logger.debug(`Ошибка при parser события: ${JSON.stringify(item)} error: ${error}`);
				}
			});
		}
	}

	// TODO чистить базу за месяц
	// TODO смотреть не перезаписывает ли матч. т.е возможно случайно его проверил уже и забыл
	// TODO посмотреть почему файл не формируется
	// TODO в pm2 под нагрузкой сформировать файл

	@Cron(process.env.NODE_ENV === 'development' ? '*/20 * * * * *' : '*/05 * * * * *')
	public async oftenCheckOfResults() {
		if (this.stackService.getLengthEvent(StackType.OFTEN)) {
			let eventDetails: EventDetails[] = await this.getEventDetails(StackType.OFTEN);
			await this.stackService.decreaseActiveEventId(StackType.OFTEN, eventDetails);
			let scoreEvents: ScoreEvents[] = this.parserFootballService.getScoreEvents(eventDetails);
			scoreEvents.forEach((item: ScoreEvents) => {
				try {
					this.dataAnalysisService.setEvent(item);
				} catch (error) {
					this.logger.debug(`Ошибка при сохранении результата события: ${JSON.stringify(item)} error: ${error}`);
				}
			});
		}
	}

	@Cron(process.env.NODE_ENV === 'development' ? '*/30 * * * * *' : '0 */02 * * * *')
	public async usuallyCheckOfResults() {
		if (this.stackService.getLengthEvent(StackType.USUALLY)) {
			let eventDetails: EventDetails[] = await this.getEventDetails(StackType.USUALLY);
			await this.stackService.decreaseActiveEventId(StackType.USUALLY, eventDetails);
		}
	}

	/**
	 * Метод для получения идентификаторов активных событий на бирже
	 */
	private async getActiveEventIds(): Promise<number[]> {
		let eventIds: number[] = [];
		try {
			let events = await this.fetchService.searchEvents(urlSearch);
			eventIds = this.parserFootballService.getIdList(events);
		} catch (error) {
			this.logger.error(`Search active event: ${error}`);
		}
		return eventIds && eventIds.length ? eventIds : [];
	}

	/**
	 * Метод для получения детальной информации для определенного события со всеми биржами.
	 *
	 * @param {Number[]} eventIds идентификаторы активных событий
	 */
	private async getEventDetailsForEvents(eventIds: number[]): Promise<EventDetails[]> {
		let eventDetails: EventDetails[] = [];
		try {
			eventDetails = await this.fetchService.getEventDetails(urlEventDetails.replace('${id}', eventIds.join()));
			let marketsEvents = await this.fetchService.searchMarketsByEvent(urlMarketsEvents, eventIds);
			let liteMarkets: LiteMarkets = this.parserFootballService.getMarketsEvents(marketsEvents);
			eventDetails = await this.getMarketNodesForEvents(eventDetails, liteMarkets);
		} catch (error) {
			this.logger.error(`Get event details for events: ${error}`);
		}
		return eventDetails && eventDetails.length ? eventDetails : [];
	}

	/**
	 * Метод для объединения детальной информации о событии с различными биржами этого события.
	 *
	 * @param {EventDetails[]} eventDetails детальная информация о событии на бирже
	 * @param {LiteMarkets} liteMarkets объекта с информацией о markets в событии.
	 */
	private async getMarketNodesForEvents(
		eventDetails: EventDetails[],
		liteMarkets: LiteMarkets,
	): Promise<EventDetails[]> {
		return await Promise.all(
			eventDetails.map(async (item: EventDetails) => {
				let res = {...item};
				if (item.eventId) {
					let markets = liteMarkets[item.eventId];
					if (markets && Array.isArray(markets) && markets.length) {
						try {
							let rateMarkets = await this.fetchService.getRateMarkets(urlByMarket.replace('${id}', markets.join()));
							let marketNodes: MarketNodes[] = this.parserFootballService.getMarketNodes(rateMarkets);
							res = {
								...res,
								marketNodes,
							};
						} catch (error) {
							this.logger.error(`Get rate markets: ${error}`);
						}
					}
				}
				return res;
			}),
		);
	}

	/**
	 * Метод для объединения детальной информации о событии из параллельных запросов.
	 */
	private async getEventDetails(stackType: StackType): Promise<EventDetails[]> {
		const idEventsArray: string[] = this.stackService.getStringEventIds(stackType);
		return await Promise.all(
			idEventsArray.map(async (item: string) => {
				return await this.fetchService.getEventDetails(urlEventDetails.replace('${id}', item));
			}),
		).then(arr => {
			return arr.reduce((acc: EventDetails[], ids: EventDetails[]) => {
				acc.push(...ids);
				return acc;
			}, []);
		});
	}
}
