import {Injectable} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChannel} from '../utils/formateMessage';
import {SeleniumApiService} from '../betsMethods/seleniumApi/seleniumApi.service';
import {betAmount} from '../store';

@Injectable()
export class BetsSimulatorService {
	constructor(
		private readonly telegramService: TelegramService,
		private readonly seleniumApiService: SeleniumApiService,
	) {}

	public async matchRate(param: IFootball) {
		const {
			rates: {under25},
		} = param;
		switch (param.strategy) {
			case 3:
				await this.telegramService.sendMessageChat(decorateMessageChannel(param));
				await this.seleniumApiService.placeOrders({
					marketId: under25.marketId,
					layOrBack: 'lay', // TODO betAmount.bets для теста back для авто ставки
					choice: {
						selectionId: under25.selectionId,
						handicap: under25.handicap,
					},
					bet: {
						price: 1.01, // TODO из базы under25.against under25.behind
						stake: betAmount.bets,
					},
				});
				break;
			default:
				break;
		}
	}
}
