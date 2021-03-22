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
			'Australian',
			'Austrian',
			'Bahraini',
			'Bangalore',
			'CONMEBOL',
			'Croatian 2',
			'Danish',
			'Dutch',
			'Ecuadorian',
			'EFL Trophy',
			'Egyptian',
			'English League 2',
			'English National',
			'Finnish',
			'French',
			'Estonian',
			'German',
			'Guatemalan',
			'Hungarian',
			'Israeli',
			'Italian',
			'Japanese',
			'Kuwaiti',
			'Latvian',
			'Lithuanian',
			'Mexican Segunda',
			'New Zealand',
			'Palestinian',
			'Panamanian',
			'Paraguayan',
			'Polish',
			'Portuguese Primeira',
			'Russian',
			'Salvadoran',
			'Slovakian',
			'Spanish',
			'Swiss Challenge',
			'Swedish',
			'Thai',
			'Tanzanian',
			'Turkish',
			'UEFA',
			'Uruguayan',
		];
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				matchOdds: {
					x: {behind: matchOddsX},
					p1: {behind: matchOddsP1},
					p2: {behind: matchOddsP2},
				},
				overUnder25: {
					marketId,
					over: {behind: TB25B, against: TB25A, selectionId, handicap},
					totalMatched,
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
		const mod = matchOddsP2 - matchOddsP1;

		switch (param.strategy) {
			case 2:
				if (!excludeGroupChannel) {
					if (TB25B > 1.4 && bothNo > 1.5) {
						if (TM20 < 4 && cornersTwo === 0) {
							if (totalMatched > 200) {
								await this.telegramService.sendMessageChannel(decorateMessageChannel(param));
								await this.telegramService.sendMessageChannel('ТБ2.5');
							}
						}
					}
				}
				if (!excludeGroupRate) {
					if (TB25A >= 1.3 && TB25A <= 1.8 && youth === 0) {
						if (matchOddsX >= 3.6 && matchOddsX <= 11) {
							if (mod >= -3) {
								await this.telegramService.sendMessageChat(decorateMessageChat(param));
								await this.fetchService.placeOrders({
									marketId,
									layOrBack: 'lay', // TODO lay для теста - back для авто ставки
									choice: {
										selectionId,
										handicap,
									},
									bet: {
										price: TB25A + 0.1,
										stake: betAmount.bets,
									},
								});
							}
						}
					}
				}
				break;
			/*case 4:
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
				break;*/
			default:
				break;
		}
	}
}
