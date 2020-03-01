import {Injectable} from '@nestjs/common';
import {IFootball} from '../football/type/football.type';
import {ConfService} from '../conf/conf.service';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChannel, decorateMessageTennis} from '../utils/formateMessage';

@Injectable()
export class BetsSimulatorService {

	constructor(
		private readonly confService: ConfService,
		private readonly telegramService: TelegramService,
	) {
	}

	public async matchRate(param: IFootball) {
		let typeRate: number = await this.confService.getTypeRate(param.strategy);
		const totalRate = param.score.sc1 + param.score.sc2 + typeRate;
		const {
			marketId,
		} = param;
		switch (param.strategy) {
			case 1 :
				console.log(marketId, totalRate);
				await this.telegramService.sendMessageChat(decorateMessageChannel(param));
				break;
			case 2 :
				console.log(marketId, totalRate);
				await this.telegramService.sendMessageChat(decorateMessageTennis(param));
				break;
			case 3 :
				console.log(marketId, totalRate);
				await this.telegramService.sendMessageChat(decorateMessageChannel(param));
				break;
			case 4 :
				console.log(marketId, totalRate);
				await this.telegramService.sendMessageChat(decorateMessageChannel(param));
				break;
			default:
				break;
		}
	}
}