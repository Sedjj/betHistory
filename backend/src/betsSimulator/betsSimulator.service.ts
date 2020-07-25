import {Injectable} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChannel} from '../utils/formateMessage';
import {betAmount} from '../store';
import {FetchService} from '../fetch/fetch.service';

@Injectable()
export class BetsSimulatorService {
	private group: string[];
	constructor(private readonly telegramService: TelegramService, private readonly fetchService: FetchService) {
		this.group = ['Belarusian', 'Faroe', 'Italian', 'Latvian', 'Slovenian', 'Swiss', 'Ukrainian'];
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				allTotalGoals: {list},
				under15,
				bothTeamsToScoreNo: {behind},
			},
			command: {group},
		} = param;

		const TM20 = list.reduce<number>((acc, x) => {
			if (x.handicap === 2.0 || x.handicap === 2) {
				acc = x.behind;
			}
			return acc;
		}, 0);
		const excludeGroup = this.group.some(x => group.includes(x));

		switch (param.strategy) {
			case 3:
				if (!excludeGroup) {
					if (TM20 > 1.33 && behind >= 1.15 && behind <= 1.53) {
						await this.telegramService.sendMessageChat(decorateMessageChannel(param));
						await this.fetchService.placeOrders({
							marketId: under15.marketId,
							layOrBack: 'back', // TODO lay для теста - back для авто ставки
							choice: {
								selectionId: under15.selectionId,
								handicap: under15.handicap,
							},
							bet: {
								price: under15.behind - 0.1,
								stake: betAmount.bets,
							},
						});
					}
				}
				break;
			default:
				break;
		}
	}
}
