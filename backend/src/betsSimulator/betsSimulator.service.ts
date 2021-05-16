import {Injectable} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChat} from '../utils/formateMessage';
import {betAmount} from '../store';
import {FetchService} from '../fetch/fetch.service';

@Injectable()
export class BetsSimulatorService {
	/*private groupForChannel: string[];*/
	private groupForRate: string[];

	constructor(private readonly telegramService: TelegramService, private readonly fetchService: FetchService) {
		/*this.groupForChannel = [];*/
		this.groupForRate = [
			'AFC',
			'Argentinian Matches',
			'Belarusian Premier League',
			'Belgian',
			'CONMEBOL Copa Libertadores',
			'Costa Rican Primera',
			'Croatian 3',
			'Czech 2',
			'Dutch',
			'Finnish',
			'French',
			'German',
			'Hungarian',
			'Icelandic',
			'Indian',
			'Iranian',
			'Israeli',
			'Italian',
			'Maltese',
			'Mexican Ascenso',
			'Moldovan',
			'Montenegrin',
			'Northern Irish',
			'Norwegian',
			'Paraguayan',
			'Qatari',
			'Romanian',
			'Russian Premier League',
			'Scottish League One',
			'Scottish League Two',
			'Spanish Women',
			'Swiss',
			'Syrian',
			'Thai Playoffs',
			'Turkish 1 Lig',
			'UEFA',
			'Uruguayan',
		];
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				matchOdds: {
					p2: {behind: matchOddsP2},
				},
				overUnder25: {
					over: {/*behind: TB25B,*/ against: TB25A},
					/*totalMatched,*/
				},
				overUnder15: {
					marketId,
					over: {against: TB15A, selectionId: over15SelectionId, handicap: over15Handicap},
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
		// const excludeGroupChannel = this.groupForChannel.some(x => group.includes(x));
		const excludeGroupRate = this.groupForRate.some(x => group.includes(x));
		const cornerSum = cornersOne + cornersTwo;

		switch (param.strategy) {
			case 4:
				if (!excludeGroupRate) {
					if (0 < cornerSum && youth === 0) {
						if (2.8 < TB25A && TB25A < 5) {
							if (1.55 <= TB15A && TB15A <= 1.8) {
								if (matchOddsP2 <= 11 && TM20 <= 1.7) {
									await this.telegramService.sendMessageChat(decorateMessageChat(param));
									await this.fetchService.placeOrders({
										marketId,
										layOrBack: 'lay', // TODO lay "против" - back "за"
										choice: {
											selectionId: over15SelectionId,
											handicap: over15Handicap,
										},
										bet: {
											price: TB15A + 0.1,
											stake: betAmount.bets,
										},
									});
								}
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
