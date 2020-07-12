import {Injectable, Logger} from '@nestjs/common';
import got, {Got} from 'got';
import config from 'config';
import {PlaceOrders} from '../../betsSimulator/type/selenium.type';
import {rateStatus} from '../../store';

@Injectable()
export class SeleniumApiService {
	private readonly logger = new Logger(SeleniumApiService.name);
	/**
	 * Массив интервалов в миллисекундах после которых делается попытка снова
	 */
	private readonly searchTimeouts: number[];
	private readonly client: Got;

	constructor() {
		this.searchTimeouts = [2000, 5000, 8000, 12000, 1];
		const server = config.get<string>('api.server');
		const port = config.get<string>('api.port');

		this.client = got.extend({
			prefixUrl: `http://${server}:${port}/selenium/`,
		});
	}

	/**
	 * Метод для ставок по отобранным критериям.
	 *
	 * @param {IFootball} param объект события
	 * @returns {Promise<JSON | void>}
	 */
	public async placeOrders(param: PlaceOrders): Promise<void> {
		if (!rateStatus.status) {
			return Promise.resolve();
		}
		return new Promise(async (resolve, reject) => {
			for (const timeout of this.searchTimeouts) {
				try {
					const {body} = await this.client.post('bet', {
						headers: {
							'Content-Type': 'application/json;charset=UTF-8',
							Accept: 'application/json, text/plain, */*',
						},
						responseType: 'json',
						body: JSON.stringify(param),
					});
					if (body != null) {
						resolve();
						break;
					}
					this.logger.error(`Error place orders -> ${body}`);
					reject('request came empty');
					break;
				} catch (error) {
					this.logger.error(`path: ${error.path}, name: ${error.name}, message: ${error.message})}`);
					this.logger.debug(`Place orders sleep on ${timeout}ms`);
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
