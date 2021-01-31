import {Injectable} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChannel} from '../utils/formateMessage';
/*import {betAmount} from '../store';
import {FetchService} from '../fetch/fetch.service';*/

@Injectable()
export class BetsSimulatorService {
	/*private group: string[];*/

	constructor(private readonly telegramService: TelegramService /*private readonly fetchService: FetchService*/) {
		/*this.group = [
			'Austrian',
			'Belarusian',
			'Belgian',
			'Bulgarian',
			'Cup',
			'Danish',
			'Ecuadorian',
			'Finnish Veikkausliiga',
			'Finnish Ykkonen',
			'Icelandic',
			'Hungarian',
			'Italian',
			'Latvian',
			'Mongolian',
			'Norwegian 2nd Division',
			'Polish',
			'Swiss',
			'Swedish Superettan',
			'UEFA',
			'Turkish',
			'Uruguayan',
			'Vietnamese',
			'Faroe',
			'German Oberliga',
			'Portuguese',
			'Maltese',
			'Elite Friendlies',
			'English',
			'Greek',
			'Serbian',
			'Russian',
			'Ukrainian',
			'Tajikistani',
			'Brazilian',
			'EFL Trophy',
			'Icelandic',
			'Romanian',
			'US Major',
			'Welsh',
			'Dutch Eerste Divisie',
			'Czech',
			'Costa Rican',
		];*/
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				overUnder25: {
					over: {behind: TB25},
				},
				matchOdds: {
					mod: {behind: behindMod},
				},
			},
			/*command: {group, youth},*/
		} = param;

		/*const TM20 = list.reduce<number>((acc, x) => {
			if (x.handicap === 2.0 || x.handicap === 2) {
				acc = x.behind;
			}
			return acc;
		}, 0);
		const excludeGroup = this.group.some(x => group.includes(x));*/

		switch (param.strategy) {
			case 1:
				if (behindMod < 7 && TB25 > 1.6) {
					await this.telegramService.sendMessageChannel(decorateMessageChannel(param));
					await this.telegramService.sendMessageChannel('ТБ2.5');
				}
				/*await this.fetchService.placeOrders({
					marketId: under25.marketId,
					layOrBack: 'lay', // TODO lay для теста - back для авто ставки
					choice: {
						selectionId: under25.selectionId,
						handicap: under25.handicap,
					},
					bet: {
						price: 0.01,
						stake: betAmount.bets,
					},
				});*/
				break;
			/*case 3:
				if (!excludeGroup) {
					if (TM20 >= 1.3 && ScoreNo <= 1.5 && youth === 0) {
						await this.telegramService.sendMessageChat(decorateMessageChannel(param));
						await this.fetchService.placeOrders({
							marketId: under15.marketId,
							layOrBack: 'back', // TODO lay для теста - back для авто ставки
							choice: {
								selectionId: under15.selectionId,
								handicap: under15.handicap,
							},
							bet: {
								price: under15.behind - 0.3,
								stake: betAmount.bets,
							},
						});
					}
				}
				break;*/
			default:
				break;
		}
	}
}
