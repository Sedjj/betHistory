import {Injectable} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChannel, decorateMessageChat} from '../utils/formateMessage';
import {betAmount} from '../store';
import {FetchService} from '../fetch/fetch.service';

@Injectable()
export class BetsSimulatorService {
	private groupForChannel: string[];
	private groupForRate: string[];

	constructor(private readonly telegramService: TelegramService, private readonly fetchService: FetchService) {
		this.groupForChannel = [
			'French',
			'Portuguese',
			'Spanish',
			'Turkish Super League',
			'Hungarian',
			'Iranian',
			'Romanian',
		];
		this.groupForRate = [
			'Argentinian',
			'Bahraini Premier',
			'Belgian',
			'Brazilian Serie A',
			'Costa Rican',
			'Czech',
			'Dutch',
			'EFL Trophy',
			'Egyptian',
			'English Championship',
			'English Premier League',
			'English League 1',
			'Finnish',
			'German',
			'Greek Super League',
			'Italian Serie A',
			'Italian Serie C',
			'Japanese',
			'Mexican Ascenso MX',
			'Nicaraguan',
			'Palestinian',
			'Portuguese',
			'Romanian',
			'Russian',
			'Salvadoran',
			'Scottish',
			'South African',
			'Spanish Segunda',
			'Swedish',
			'Swiss',
			'UEFA',
			'Thai',
			'Tunisian',
			'Turkish',
			'Uruguayan',
		];
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				overUnder25: {
					over: {behind: TB25},
					totalMatched,
				},
				overUnder15: {
					marketId,
					under: {behind: TM15, selectionId, handicap},
				},
				bothTeamsToScore: {
					no: {behind: bothNo},
				},
				goalLines: {list},
			},
			cards: {
				two: {corners: cornersTwo},
			},
			command: {group, youth},
		} = param;

		const TM20 = list.reduce<number>((acc, x) => {
			if (x.under.handicap === 2.0 || x.under.handicap === 2) {
				acc = x.under.behind;
			}
			return acc;
		}, 0);
		const excludeGroupChannel = this.groupForChannel.some(x => group.includes(x));
		const excludeGroupRate = this.groupForRate.some(x => group.includes(x));

		switch (param.strategy) {
			case 2:
				if (!excludeGroupChannel) {
					if (TB25 > 1.4 && bothNo > 1.5) {
						if (TM20 < 4 && cornersTwo === 0) {
							if (totalMatched > 200) {
								await this.telegramService.sendMessageChannel(decorateMessageChannel(param));
								await this.telegramService.sendMessageChannel('ТБ2.5');
							}
						}
					}
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
			case 4:
				if (!excludeGroupRate) {
					if (TM15 > 1.5 && bothNo > 1.2 && bothNo < 1.5) {
						if (TM20 >= 1.2 && youth === 0) {
							if (totalMatched > 10 && totalMatched < 20000) {
								await this.telegramService.sendMessageChat(decorateMessageChat(param));
								await this.fetchService.placeOrders({
									marketId,
									layOrBack: 'back', // TODO lay для теста - back для авто ставки
									choice: {
										selectionId,
										handicap,
									},
									bet: {
										price: TM15 - 0.2,
										stake: betAmount.bets,
									},
								});
							}
						}
					}
				}
				break;
			default:
				break;
		}
	}
}
