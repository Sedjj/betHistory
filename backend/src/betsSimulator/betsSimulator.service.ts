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
			'Argentinian Primera B',
			'Belarusian',
			'Belgian',
			'CAF',
			'Czech 1 Liga',
			'CONMEBOL',
			'Estonian',
			'FIFA',
			'Honduras',
			'Hungarian',
			'Iranian',
			'Italian Serie D',
			'Kenyan',
			'Mexican Liga MX',
			'Portuguese Primeira',
			'Romanian',
			'Scottish',
			'Russian',
			'Spanish Tercera',
			'Tanzanian',
			'Uruguayan',
		];
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				matchOdds: {
					p1: {behind: matchOddsP1},
					p2: {behind: matchOddsP2},
				},
				overUnder25: {
					marketId,
					over: {behind: TB25B, against: TB25A, selectionId, handicap},
					totalMatched,
				},
				overUnder15: {
					over: {against: TB15A},
				},
				bothTeamsToScore: {
					no: {behind: bothNo},
				},
				goalLines: {list},
			},
			cards: {
				two: {corners: cornersTwo},
			},
			command: {group},
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
					if (TB25A < 1.9 && TM20 <= 2.45) {
						if (1.1 < TB15A && TB15A < 1.2) {
							if (-3.4 < mod && mod < 22) {
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
