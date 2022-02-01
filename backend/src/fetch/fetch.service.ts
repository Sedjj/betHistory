import {Injectable} from '@nestjs/common';
import got, {Got} from 'got';
import config from 'config';
import {PlaceOrders} from '../betsSimulator/type/selenium.type';
import {rateStatus} from '../store';
import {MyLogger} from '../logger/myLogger.service';

@Injectable()
export class FetchService {
	private readonly client: Got;

	constructor(private readonly log: MyLogger) {
		const server = config.get<string>('api.server');
		const port = config.get<string>('api.port');

		this.client = got.extend({
			prefixUrl: `http://${server}:${port}/rate/`,
		});
	}

	/**
	 * Метод отправки сообщений в чат support бота.
	 */
	public async getLogOtherServer(): Promise<Buffer> {
		try {
			const {body} = await this.client.get('log', {
				responseType: 'buffer',
			});
			this.log.debug(FetchService.name, 'Response get log successfully');
			return body;
		} catch (error) {
			this.log.error(FetchService.name, `Error name: ${error.name}, message: ${error.message}`);
			throw new Error(error);
		}
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
		try {
			const {body} = await this.client.post('selenium/bet', {
				headers: {
					'Content-Type': 'application/json;charset=UTF-8',
					Accept: 'application/json, text/plain, */*',
				},
				body: JSON.stringify(param),
			});
			this.log.debug(FetchService.name, `Response bet ${param.marketId} successfully; Body: ${body}`);
		} catch (error) {
			this.log.error(FetchService.name, `Error name: ${error.name}, message: ${error.message}`);
		}
	}
}
