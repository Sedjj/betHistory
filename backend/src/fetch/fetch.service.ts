import {Injectable} from '@nestjs/common';
import config from 'config';
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
		const prefixUrl: string = config.get<string>('parser.baseUrl');
		this.client = got.extend({
			prefixUrl,
			cookieJar
		});
	}

	/**
	 * Метод для получения всех ставок по виду спорта.
	 *
	 * @param {String} url адрес запроса
	 * @returns {Promise<JSON | void>}
	 */
	public getAllMatches(url: string): any {
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
						log.error(`Get all matches JSON.parse: ${error}`);
						reject('JSON parse error');
						break;
					}
					log.error(`Get all matches error: ${body}`);
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