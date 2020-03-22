import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {FetchService} from '../fetch/fetch.service';
import config from 'config';
import {ParserFootballService} from '../parser/parserFootball.service';
import {DataAnalysisService} from '../dataAnalysis/dataAnalysis.service';
import {IFootball} from '../football/type/football.type';
import {EventDetails} from '../parser/type/eventDetails.type';
import {LiteMarkets} from '../parser/type/marketsEvents.type';
import {MarketNodes} from '../parser/type/byMarket.type';
import {ScoreEvents} from '../parser/type/scoreEvents.type';

const urlSearch = config.get<string>('parser.football.search');
const urlEventDetails = config.get<string>('parser.football.eventDetails');
const urlMarketsEvents = config.get<string>('parser.football.marketsEvents');
const urlByMarket = config.get<string>('parser.football.byMarket');

@Injectable()
export class TaskService implements OnApplicationBootstrap {
	private readonly logger = new Logger(TaskService.name);
	private activeEventIds: number[] = [];

	constructor(
		private fetchService: FetchService,
		private parserFootballService: ParserFootballService,
		private dataAnalysisService: DataAnalysisService,
	) {
	}

	onApplicationBootstrap() {
		this.logger.debug('****start scheduler search football****');
		this.logger.debug('****start scheduler checking results****');
	}

	@Cron((process.env.NODE_ENV === 'development') ? '*/30 * * * * *' : '*/02 * * * *')
	public async searchFootball() {
		let activeEventIds: number[] = await this.getActiveEventIds();
		if (activeEventIds.length) {
			let eventDetails = await this.getEventDetailsForEvents(activeEventIds);
			eventDetails.forEach((item: EventDetails) => {
				try {
					let param: IFootball = this.parserFootballService.getParams(item);
					this.dataAnalysisService.strategyDefinition(param, this.increaseActiveEventId);
				} catch (error) {
					this.logger.debug(`Ошибка при парсинге события: ${JSON.stringify(item)} error: ${error}`);
				}
			});
		}
	}

	@Cron((process.env.NODE_ENV === 'development') ? '*/15 * * * * *' : '*/30 * * * *')
	public async checkingResults() {
		if (this.activeEventIds.length) {
			console.log(this.activeEventIds);
			let eventDetails: EventDetails[] = await this.fetchService.getEventDetails(urlEventDetails.replace('${id}', this.activeEventIds.join()));
			this.decreaseActiveEventId(eventDetails);
			let scoreEvents: ScoreEvents[] = this.parserFootballService.getScoreEvents(eventDetails);
			scoreEvents.forEach((item: ScoreEvents) => {
				try {
					this.dataAnalysisService.setEvent(item);
				} catch (error) {
					this.logger.debug(`Ошибка при сохранении результата события: ${JSON.stringify(item)} error: ${error}`);
				}
			});
		} else {
			console.log(this.activeEventIds);
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
	private async getMarketNodesForEvents(eventDetails: EventDetails[], liteMarkets: LiteMarkets): Promise<EventDetails[]> {
		return await Promise.all(eventDetails.map(async (item: EventDetails) => {
			let res = {...item};
			if (item.eventId) {
				let markets = liteMarkets[item.eventId];
				if (markets && Array.isArray(markets) && markets.length) {
					try {
						let rateMarkets = await this.fetchService.getRateMarkets(urlByMarket.replace('${id}', markets.join()));
						let marketNodes: MarketNodes[] = this.parserFootballService.getMarketNodes(rateMarkets);
						res = {
							...res,
							marketNodes
						};
					} catch (error) {
						this.logger.error(`Get rate markets: ${error}`);
					}
				}
			}
			return res;
		}));
	}

	/**
	 * Метод для добавления событий в активные
	 *
	 * @param {Number} id идентификатор события
	 */
	private increaseActiveEventId = (id: number): void => {
		if (!this.activeEventIds.includes(id)) {
			this.activeEventIds.push(id);
		}
	};

	/**
	 * Метод для обновления активных событий.
	 *
	 * @param {EventDetails[]} eventDetails детальная информация о событии на бирже
	 */
	private decreaseActiveEventId = (eventDetails: EventDetails[]): void => {
		this.activeEventIds = eventDetails.reduce<number[]>((acc, eventDetail) => {
			if (eventDetail.eventId) {
				acc.push(eventDetail.eventId);
			}
			return acc;
		}, []);
	};
}