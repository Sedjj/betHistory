import {Injectable, Logger} from '@nestjs/common';
import got, {Got} from 'got';
import {CookieJar} from 'tough-cookie';
import {EventDetails} from './type/eventDetails.type';

@Injectable()
export class FetchService {
	private readonly logger = new Logger(FetchService.name);
	/**
	 * Массив интервалов в миллисекундах после которых делается попытка снова
	 */
	private readonly searchTimeouts: number[];
	private readonly client: Got;

	constructor() {
		this.searchTimeouts = [2000, 5000, 8000, 12000, 1];
		const cookieJar = new CookieJar();
		this.client = got.extend({
			cookieJar
		});
	}

	/**
	 * Метод для получения всех ставок по виду спорта.
	 *
	 * @param {String} url адрес запроса
	 * @returns {Promise<JSON | void>}
	 */
	public searchEvents(url: string): Promise<any> {
		return new Promise(async (resolve, reject) => {
			for (const timeout of this.searchTimeouts) {
				try {
					const {body} = await this.client.post(url, {
						headers: {
							'Content-Type': 'application/json;charset=UTF-8',
							'Accept': 'application/json, text/plain, */*'
						},
						responseType: 'json',
						body: JSON.stringify({
								filter: {
									marketBettingTypes: ['ASIAN_HANDICAP_SINGLE_LINE', 'ASIAN_HANDICAP_DOUBLE_LINE', 'ODDS'],
									productTypes: ['EXCHANGE'],
									marketTypeCodes: ['MATCH_ODDS'], // второй фильтр (переры, ставки, обе забъют) OVER_UNDER_45 BOTH_TEAMS_TO_SCORE HALF_TIME
									selectBy: 'FIRST_TO_START_AZ', // первый фильтр (MAXIMUM_TRADED - в паре, RANK - соревнованияб FIRST_TO_START_AZ - время)
									turnInPlayEnabled: true,
									maxResults: 0,
									eventTypeIds: [1] // 1 - это футбол
								},
								facets: [{type: 'MARKET'}],
								currencyCode: 'EUR',
								locale: 'en' // локаль на сайте
							}
						)
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.logger.error(`Search events request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.logger.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
					this.logger.debug(`Get all matches sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Метод для получения подробной информации о событии.
	 *
	 * @param {String} url адрес запроса
	 * @returns {Promise<JSON | void>}
	 */
	public getEventDetails(url: string): Promise<EventDetails[]> {
		return new Promise(async (resolve, reject) => {
			for (const timeout of this.searchTimeouts) {
				try {
					const {body} = await this.client.get(url, {
						headers: {
							'Content-Type': 'application/json;charset=UTF-8',
							'Accept': 'application/json, text/plain, */*'
						},
						responseType: 'json',
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.logger.error(`Get event details request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.logger.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
					this.logger.debug(`Get event details sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Метод для получения markets у события
	 *
	 * @param {String} url адрес запроса
	 * @param {Number[]} eventIds идентификаторы событий
	 */
	public searchMarketsByEvent(url: string, eventIds: number[]): Promise<any> {
		return new Promise(async (resolve, reject) => {
			for (const timeout of this.searchTimeouts) {
				try {
					const {body} = await this.client.post(url, {
						headers: {
							'Content-Type': 'application/json;charset=UTF-8',
							'Accept': 'application/json, text/plain, */*'
						},
						responseType: 'json',
						body: JSON.stringify({
								filter: {
									marketBettingTypes: ['ASIAN_HANDICAP_SINGLE_LINE', 'ASIAN_HANDICAP_DOUBLE_LINE', 'ODDS'],
									eventTypeIds: [1],
									productTypes: ['EXCHANGE'],
									selectBy: 'RANK',
									maxResults: 0,
									attachments: ['MARKET_LITE'],
									marketTypeCodes: ['MATCH_ODDS', 'OVER_UNDER_15', 'OVER_UNDER_25', 'BOTH_TEAMS_TO_SCORE', 'ALT_TOTAL_GOALS'],
									upperLevelEventIds: eventIds,
									turnInPlayEnabled: true
								},
								facets: [{type: 'MARKET'}],
								currencyCode: 'EUR',
								locale: 'en'
							}
						)
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.logger.error(`Search markets by event request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.logger.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
					this.logger.debug(`Search markets by event sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Метод для получения расширеных ставок для текущего матча.
	 * types: MARKET_STATE,EVENT,RUNNER_STATE,RUNNER_DESCRIPTION,RUNNER_EXCHANGE_PRICES_BEST,MARKET_RATES,MARKET_DESCRIPTION,RUNNER_METADATA,MARKET_LINE_RANGE_INFO
	 * @param {String} url адрес запроса
	 * @returns {Promise<JSON | void>}
	 */
	public getRateMarkets(url: string): Promise<any> {
		return new Promise(async (resolve, reject) => {
			for (const timeout of this.searchTimeouts) {
				try {
					const {body} = await this.client.get(url, {
						headers: {
							'Content-Type': 'application/json;charset=UTF-8',
							'Accept': 'application/json, text/plain, */*'
						},
						responseType: 'json'
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.logger.error(`Get rate markets request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.logger.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
					this.logger.debug(`Get rate markets sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Функция ожидания реализованая через промис + таймаут, прелполагается использовать с async/await.
	 *
	 * @param {number} ms - количество миллисекунд которое требуется выждать
	 * @return {Promise<number>} - промис, резолв которого будет означать что время вышло
	 */
	private sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}