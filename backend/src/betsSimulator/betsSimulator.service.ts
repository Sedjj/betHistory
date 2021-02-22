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
		this.groupForChannel = ['French', 'Portuguese', 'Spanish'];
		this.groupForRate = [
			'Argentinian',
			'Bahraini Premier',
			'Bangladesh',
			'Brazilian',
			'Dutch',
			'EFL Trophy',
			'Egyptian',
			'English Premier League',
			'Greek',
			'Italian Serie A (W)',
			'Italian Serie B',
			'Italian Serie C',
			'Nicaraguan',
			'New Zealand',
			'Paraguayan',
			'Portuguese Campeonato',
			'Romanian',
			'Russian',
			'Salvadoran',
			'Scottish',
			'South African',
			'Spanish La Liga',
			'Spanish Segunda',
			'Swedish',
			'Swiss',
			'Thai',
			'UEFA',
			'Uruguayan',
		];
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				overUnder25: {
					over: {behind: TB25},
				},
				overUnder15: {
					marketId,
					under: {behind: TM15, selectionId, handicap},
				},
				bothTeamsToScore: {
					yes: {behind: bothYes},
					no: {behind: bothNo},
				},
				matchOdds: {
					mod: {behind: behindMod},
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
					if (TB25 > 1.4 && bothYes > 0 && bothYes < 1.55) {
						if (TM20 < 4.7 && cornersTwo < 2) {
							if (behindMod >= 0.3 && behindMod <= 5.5) {
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
							await this.telegramService.sendMessageChat(decorateMessageChat(param));
							await this.fetchService.placeOrders({
								marketId,
								layOrBack: 'lay', // TODO lay для теста - back для авто ставки
								choice: {
									selectionId,
									handicap,
								},
								bet: {
									price: 0.01, // TM15 - 0.03
									stake: betAmount.bets,
								},
							});
						}
					}
				}
				break;
			default:
				break;
		}
	}
}
