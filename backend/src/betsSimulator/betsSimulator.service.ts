import {Injectable} from '@nestjs/common';
import {IFootball} from '../football/type/football.type';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChannel} from '../utils/formateMessage';

@Injectable()
export class BetsSimulatorService {
	constructor(
		private readonly telegramService: TelegramService,
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
			case 4:
				console.log(marketId);
				await this.telegramService.sendMessageChat(decorateMessageChannel(param));
				break;
			default:
				break;
		}
	}
}