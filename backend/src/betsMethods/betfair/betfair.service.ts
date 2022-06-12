import {Injectable} from '@nestjs/common';
import {CookieJar} from 'tough-cookie';
import got, {Got} from 'got';
import {IFootball} from '../../model/football/type/football.type';
import FormData from 'form-data';
import {MyLogger} from '../../logger/myLogger.service';

@Injectable()
export class BetfairService {
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

	/*https://identitysso.betfair.com/api/login

		POST

	product=exchange&redirectMethod=GET&url=https%3A%2F%2Fwww.betfair.com%2Fexchange%2Fplus%2Ffootball%2Fmarket%2F1.170396923&submitForm=true&tmxId=3ad39046-0df1-4d8d-8f26-ae994bddd262&username=SemakovMN%40gmail.com&password=swcBGM4283uVpHt*/

	/**
	 * Метод для получения токена.
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
						body: JSON.stringify(form),
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.log.error(BetfairService.name, `Place orders request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.log.error(BetfairService.name, `path: ${error.path}, name: ${error.name}, message: ${error.message}`);
					this.log.debug(BetfairService.name, `Get all matches sleep on ${timeout}ms`);
					await this.sleep(timeout);
				}
			}
			reject('Server is not responding');
		});
	}

	/**
	 * Метод для ставок по отобранным критериям.
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
							'X-Authentication': 'TYQF6tkE8iaPSPZK283sJRMPrzuYyFVoR9cfRUTVg/8=',
						},
						responseType: 'json',
						body: JSON.stringify({
							marketId: 1.170380516,
							instructions: [
								{
									selectionId: 7044483,
									handicap: 1.0,
									side: 'LAY',
									orderType: 'LIMIT',
									limitOrder: {
										size: 3,
										price: 1.01,
									},
								},
							],
						}),
					});
					if (body != null) {
						resolve(body);
						break;
					}
					this.log.error(BetfairService.name, `Place orders request came empty: ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.log.error(BetfairService.name, `path: ${error.path}, name: ${error.name}, message: ${error.message}`);
					this.log.debug(BetfairService.name, `Get all matches sleep on ${timeout}ms`);
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
