import {Injectable} from '@nestjs/common';
import got, {Got} from 'got';
import {CookieJar} from 'tough-cookie';
import {log} from '../utils/logger';

@Injectable()
export class FetchService {
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
	public searchMatches(url: string): Promise<any> {
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
									marketTypeCodes: ['MATCH_ODDS'],
									selectBy: 'FIRST_TO_START_AZ',
									ontentGroup: {
										language: 'en',
										regionCode: 'UK'
									},
									turnInPlayEnabled: true,
									maxResults: 0,
									eventTypeIds: [1] // 1 - это футбол
								},
								facets: [{
									type: 'EVENT_TYPE',
									skipValues: 0,
									/*maxValues: 10,*/
									next: {
										type: 'EVENT',
										skipValues: 0,
										maxValues: 10,
										next: {
											type: 'MARKET',
											maxValues: 1
										}
									}
								}
								],
								currencyCode: 'EUR',
								locale: 'en'
							}
						)
					});
					if (body != null) {
						resolve(body);
						break;
					}
					log.error(`Search matches request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					log.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
					log.debug(`Get all matches sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Метод для получения всех ставок по виду спорта.
	 *
	 * @param {String} url адрес запроса
	 * @returns {Promise<JSON | void>}
	 */
	public getAllMatches(url: string): Promise<any[]> {
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
						if (body['eventTypes'] && Array.isArray(body['eventTypes']) && body['eventTypes'].length) {
							let eventTypes: any[] = body['eventTypes'][0];
							if (eventTypes['eventNodes'] && Array.isArray(eventTypes['eventNodes']) && eventTypes['eventNodes'].length) {
								resolve(eventTypes['eventNodes']);
								break;
							}
						}
					}
					log.error(`Get all matches request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					log.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
					log.debug(`Get all matches sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Метод для получения расширеных ставок для текущего матча.
	 *
	 * @param {String} url адрес запроса
	 * @returns {Promise<JSON | void>}
	 */
	public getExpandedMatch(url: string): any {
		return new Promise(async (resolve, reject) => {
			for (const timeout of this.searchTimeouts) {
				try {
					let value = [];
					const {body} = await this.client.get(url);
					try {
						value = JSON.parse(body)['Value'];
						if (value != null) {
							resolve(value);
							break;
						}
					} catch (error) {
						log.error(`Get expanded matches JSON.parse: ${error}`);
						reject('JSON parse error');
						break;
					}
					log.error(`Get expanded matches error: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					log.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
					log.debug(`Get expanded matches sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Метод для получения всех результатов.
	 *
	 * @param {String} url адрес запроса
	 * @returns {Promise<any>}
	 */
	public getResultList(url: string): any {
		return new Promise(async (resolve, reject) => {
			for (const timeout of this.searchTimeouts) {
				try {
					let value = [];
					log.debug(`url: ${url}`);
					const {body} = await this.client.get(url);
					try {
						value = JSON.parse(body)['Data'];
						if (value != null) {
							resolve(value);
							break;
						}
					} catch (error) {
						log.error(`Get result matches JSON.parse: ${error}`);
						reject('JSON parse error');
						break;
					}
					log.error(`Get result matches error: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					log.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
					log.debug(`Get result matches sleep on ${timeout}ms`);
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