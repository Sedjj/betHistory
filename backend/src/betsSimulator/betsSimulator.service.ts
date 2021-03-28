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
			'Azerbaijan',
			'Bahraini',
			'Bangalore',
			'French',
			'French Ligue 1',
			'Friend',
			'German 3 Liga',
			'German 3 Liga',
			'Israeli Liga Alef',
			'Italian Serie A',
			'Italian Serie D',
			'Japanese',
			'Kuwaiti',
			'Mexican Ascenso MX',
			'Regionalliga',
			'Russian',
			'Scottish',
			'South Korean',
			'Spanish Women',
			'Swedish',
			'Tanzanian',
			'Turkish Cup',
			'Turkish Super League',
			'UEFA',
			'Ugandan',
			'Uruguayan',
			'Welsh',
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
				overUnder15: {
					over: {against: TB15A},
				},
				bothTeamsToScore: {
					no: {behind: bothNo},
				},
				goalLines: {list},
			},
			cards: {
				one: {corners: cornersOne},
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
		const sumCorners = cornersOne + cornersTwo;

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
					if (TB25A <= 1.85 && TB15A < 1.2 && youth === 0) {
						if (4 <= matchOddsX && matchOddsX <= 11) {
							if (4 <= mod && mod <= 33) {
								if (0 < sumCorners && sumCorners < 5) {
									if (2.2 < TM20 && TM20 < 5) {
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
