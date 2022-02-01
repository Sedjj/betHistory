import {Injectable} from '@nestjs/common';
import got, {Got} from 'got';
import {CookieJar} from 'tough-cookie';
import {EventDetails} from './type/eventDetails.type';
import {MyLogger} from '../logger/myLogger.service';

@Injectable()
export class FetchService {
	/**
	 * Массив интервалов в миллисекундах после которых делается попытка снова
	 */
	private readonly searchTimeouts: number[];
	private readonly client: Got;

	constructor(private readonly log: MyLogger) {
		this.searchTimeouts = [2000, 5000, 8000, 12000, 1];
		const cookieJar = new CookieJar();
		this.client = got.extend({
			cookieJar,
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
							Accept: 'application/json, text/plain, */*',
						},
						responseType: 'json',
						body: JSON.stringify({
							filter: {
								marketBettingTypes: ['ASIAN_HANDICAP_SINGLE_LINE', 'ASIAN_HANDICAP_DOUBLE_LINE', 'ODDS'],
								productTypes: ['EXCHANGE'],
								marketTypeCodes: ['MATCH_ODDS'], // второй фильтр (перерыв, ставки, обе забьют) OVER_UNDER_45 BOTH_TEAMS_TO_SCORE HALF_TIME
								selectBy: 'FIRST_TO_START_AZ', // первый фильтр (MAXIMUM_TRADED - в паре, RANK - соревнования FIRST_TO_START_AZ - время)
								turnInPlayEnabled: true,
								maxResults: 0,
								eventTypeIds: [1], // 1 - это футбол
							},
							facets: [{type: 'MARKET'}],
							currencyCode: 'EUR',
							locale: 'en', // локаль на сайте
						}),
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.log.error(FetchService.name, `Search events request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.log.error(
						FetchService.name,
						`path: ${error.path}, code: ${error.code}, name: ${error.name}, message: ${error.message}`,
					);
					this.log.debug(FetchService.name, `Get all matches sleep on ${timeout}ms`);
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
					const {body} = await this.client.get<EventDetails[]>(url, {
						headers: {
							'Content-Type': 'application/json;charset=UTF-8',
							Accept: 'application/json, text/plain, */*',
						},
						responseType: 'json',
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.log.error(FetchService.name, `Get event details request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.log.error(
						FetchService.name,
						`path: ${error.path}, code: ${error.code}, name: ${error.name}, message: ${error.message}`,
					);
					this.log.debug(FetchService.name, `Get event details sleep on ${timeout}ms`);
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
							Accept: 'application/json, text/plain, */*',
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
								marketTypeCodes: [
									'MATCH_ODDS',
									'OVER_UNDER_15',
									'OVER_UNDER_25',
									'BOTH_TEAMS_TO_SCORE',
									'ALT_TOTAL_GOALS',
								],
								upperLevelEventIds: eventIds,
								turnInPlayEnabled: true,
							},
							facets: [{type: 'MARKET'}],
							currencyCode: 'EUR',
							locale: 'en',
						}),
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.log.error(FetchService.name, `Search markets by event request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.log.error(
						FetchService.name,
						`path: ${error.path}, code: ${error.code}, name: ${error.name}, message: ${error.message}`,
					);
					this.log.debug(FetchService.name, `Search markets by event sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Метод для получения расширенных ставок для текущего матча.
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
							Accept: 'application/json, text/plain, */*',
						},
						responseType: 'json',
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.log.error(FetchService.name, `Get rate markets request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.log.error(
						FetchService.name,
						`path: ${error.path}, code: ${error.code}, name: ${error.name}, message: ${error.message}`,
					);
					this.log.debug(FetchService.name, `Get rate markets sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Функция ожидания реализованная через промис + таймаут, предполагается использовать с async/await.
	 *
	 * @param {number} ms - количество миллисекунд которое требуется выждать
	 * @return {Promise<number>} - промис, resolve которого будет означать что время вышло
	 */
	private sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}
