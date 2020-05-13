import {Injectable} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChannel} from '../utils/formateMessage';
/*import {BetfairService} from '../betfair/betfair.service';*/

@Injectable()
export class BetsSimulatorService {
	constructor(
		private readonly telegramService: TelegramService,
		/*private readonly betfairService: BetfairService,*/
	) {
	}

	public async matchRate(param: IFootball) {
		const {
			marketId,
		} = param;
		switch (param.strategy) {
			case 1:
				// await this.telegramService.sendMessageChat(decorateMessageChannel(param));
				break;
			case 5:
				console.log(marketId);
				await this.telegramService.sendMessageChat(decorateMessageChannel(param));
				// await this.betfairService.bet(param);
				break;
			default:
				break;
		}
	}
}