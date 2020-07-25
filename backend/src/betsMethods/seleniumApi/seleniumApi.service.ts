import {Injectable, Logger} from '@nestjs/common';
import got, {Got} from 'got';
import config from 'config';
import {PlaceOrders} from '../../betsSimulator/type/selenium.type';
import {rateStatus} from '../../store';

@Injectable()
export class SeleniumApiService {
	private readonly logger = new Logger(SeleniumApiService.name);
	private readonly client: Got;

	constructor() {
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
		try {
			const {body} = await this.client.post('bet', {
				headers: {
					'Content-Type': 'application/json;charset=UTF-8',
					Accept: 'application/json, text/plain, */*',
				},
				body: JSON.stringify(param),
			});
			this.logger.debug(`Response bet ${param.marketId} successfully; Body: ${body}`);
		} catch (error) {
			this.logger.error(`Error name: ${error.name}, message: ${error.message}`);
		}
	}
}
