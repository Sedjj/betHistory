import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
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
import {StackService} from './stack/stack.service';
import {StackType} from '../model/stack/type/stack.type';
import {MyLogger} from '../logger/myLogger.service';
import {ConfService} from '../model/conf/conf.service';
import {errorsStack} from '../store';
import {TelegramService} from '../telegram/telegram.service';
import {ExportService} from '../export/export.service';

const urlSearch = config.get<string>('parser.football.search');
const urlEventDetails = config.get<string>('parser.football.eventDetails');
const urlMarketsEvents = config.get<string>('parser.football.marketsEvents');
const urlByMarket = config.get<string>('parser.football.byMarket');

@Injectable()
export class TaskService implements OnApplicationBootstrap {
	constructor(
		private fetchService: FetchService,
		private parserFootballService: ParserFootballService,
		private dataAnalysisService: DataAnalysisService,
		private readonly stackService: StackService,
		private readonly exportService: ExportService,
		private readonly log: MyLogger,
		private readonly confService: ConfService,
		private readonly telegramService: TelegramService,
	) {}

	async onApplicationBootstrap() {
		this.log.debug(TaskService.name, '****start scheduler search football****');
		this.log.debug(TaskService.name, '****start scheduler checking results****');
	}

	@Cron(process.env.NODE_ENV === 'development' ? '*/15 * * * * *' : '*/30 * * * * *')
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
					);
				} catch (error) {
					this.log.debug(
						TaskService.name,
						`Ошибка при parser события: ${JSON.stringify(item)} error: ${error}`,
					);
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
					this.log.debug(
						TaskService.name,
						`Ошибка при сохранении результата события: ${JSON.stringify(item)} error: ${error}`,
					);
				}
			});
		}
	}

	@Cron(process.env.NODE_ENV === 'development' ? '*/30 * * * * *' : '0 */02 * * * *')
	public async usuallyCheckOfResults() {
		if (this.stackService.getLengthEvent(StackType.UNUSUAL)) {
			let eventDetails: EventDetails[] = await this.getEventDetails(StackType.UNUSUAL);
			await this.stackService.decreaseActiveEventId(StackType.UNUSUAL, eventDetails);
		}
	}

	@Cron(process.env.NODE_ENV === 'development' ? '0 */10 * * * *' : '0 */15 * * * *')
	public async checkDatabase() {
		try {
			await this.confService.getTime();
		} catch (e) {
			const message = `Database not responding - ${e}`;
			if (!errorsStack.isStack(message)) {
				this.log.error(TaskService.name, message);
				await this.telegramService.sendMessageSupport(`<pre>${message}</pre>`);
			}
			errorsStack.setErrorsStack(message);
		}
	}

	@Cron(process.env.NODE_ENV === 'development' ? '0 */20 * * * *' : '0 0 10 * * *')
	public async exportEveryDays() {
		try {
			const file = await this.exportService.exportFootballStatisticStream(2, 0);
			await this.telegramService.sendFileOfBuffer(file.buffer, file.filename);
		} catch (error) {
			this.log.error(TaskService.name, `Error - export every days: ${error}`);
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
			this.log.error(TaskService.name, `Search active event: ${error}`);
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
			eventDetails = await this.fetchService.getEventDetails(
				urlEventDetails.replace('${id}', eventIds.join()),
			);
			let marketsEvents = await this.fetchService.searchMarketsByEvent(urlMarketsEvents, eventIds);
			let liteMarkets: LiteMarkets = this.parserFootballService.getMarketsEvents(marketsEvents);
			eventDetails = await this.getMarketNodesForEvents(eventDetails, liteMarkets);
		} catch (error) {
			this.log.error(TaskService.name, `Get event details for events: ${error}`);
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
							let rateMarkets = await this.fetchService.getRateMarkets(
								urlByMarket.replace('${id}', markets.join()),
							);
							let marketNodes: MarketNodes[] =
								this.parserFootballService.getMarketNodes(rateMarkets);
							res = {
								...res,
								marketNodes,
							};
						} catch (error) {
							this.log.error(TaskService.name, `Get rate markets: ${error}`);
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
