import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {CookieJar} from 'tough-cookie';
import got, {Got} from 'got';
import {IFootball} from '../football/type/football.type';
import FormData from 'form-data';

@Injectable()
export class BetfairService implements OnApplicationBootstrap {
	private readonly logger = new Logger(BetfairService.name);
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

	async onApplicationBootstrap() {
		console.log('655464');
	}

	/**
	 * Метод для получения всех ставок по виду спорта.
	 *
	 * @returns {Promise<JSON | void>}
	 */
	public getToken(): Promise<any> {
		const form = new FormData();
		return new Promise(async (resolve, reject) => {
			for (const timeout of this.searchTimeouts) {
				try {
					form.append('product', 'exchange');
					form.append('redirectMethod', 'GET');
					form.append('submitForm', 'true');
					form.append('username', 'SemakovMN@gmail.com');
					form.append('password', 'swcBGM4283uVpHt');
					const body = await this.client.post('https://identitysso.betfair.com/api/login', {
						responseType: 'text',
						body: JSON.stringify(form)
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.logger.error(`Place orders request came empty: ${body}`);
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
	 * Метод для получения всех ставок по виду спорта.
	 *
	 * @param {IFootball} param объект события
	 * @returns {Promise<JSON | void>}
	 */
	public placeOrders(param: IFootball): Promise<any> {
		return new Promise(async (resolve, reject) => {
			for (const timeout of this.searchTimeouts) {
				try {
					const body = await this.client.post('https://api.betfair.com/exchange/betting/rest/v1.0/placeOrders/', {
						headers: {
							'Content-Type': 'application/json',
							'X-Application': 'xXHoZhQ88z8byjKV',
							'X-Authentication': 'TYQF6tkE8iaPSPZK283sJRMPrzuYyFVoR9cfRUTVg/8='
						},
						responseType: 'json',
						body: JSON.stringify({
							marketId: 1.170380516,
							instructions: [{
								selectionId: 7044483,
								handicap: 1.0,
								side: 'LAY',
								orderType: 'LIMIT',
								limitOrder: {
									size: 3,
									price: 1.01
								}
							}]
						})
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.logger.error(`Place orders request came empty: ${body}`);
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
	 * Функция ожидания реализованая через промис + таймаут, прелполагается использовать с async/await.
	 *
	 * @param {number} ms - количество миллисекунд которое требуется выждать
	 * @return {Promise<number>} - промис, резолв которого будет означать что время вышло
	 */
	private sleep(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
}
