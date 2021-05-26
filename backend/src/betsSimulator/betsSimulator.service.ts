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
			'Argentinian',
			'Austrian Bundesliga',
			'Azerbaijan',
			'Bangladesh',
			'Belgian',
			'Bulgarian',
			'Colombian',
			'CONCACAF',
			'CONMEBOL',
			'Croatian 2 HNL',
			'Croatian 3. HNL',
			'Czech',
			'Danish',
			'Dutch Eredivisie',
			'Ecuadorian',
			'Egyptian',
			'FIFA',
			'English Premier League',
			'French',
			'Friend',
			'Georgian',
			'German 3 Liga',
			'Guatemalan',
			'Honduras',
			'Icelandic',
			'Irish',
			'Israeli',
			'Italian',
			'Kazakhstan',
			'Lithuanian',
			'Malaysian Super League',
			'Nicaraguan',
			'Palestinian',
			'Paraguayan',
			'Peruvian',
			'Qatari Stars',
			'Russian',
			'Scottish',
			'Serbian',
			'African',
			'Spanish Segunda Division B',
			'Swedish Division 1',
			'Swiss',
			'Syrian',
			'UEFA',
			'Ukrainian',
			'Uruguayan',
			'US Major',
			'Welsh',
			'US National',
		];
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				matchOdds: {
					p2: {behind: matchOddsP2},
				},
				/*overUnder25: {
					over: {behind: TB25B, against: TB25A},
					totalMatched,
				},*/
				overUnder15: {
					marketId,
					over: {against: TB15A, selectionId: over15SelectionId, handicap: over15Handicap},
					under: {behind: TM15B, selectionId: under15SelectionId, handicap: under15Handicap},
				},
				/*goalLines: {list},*/
			},
			cards: {
				one: {corners: cornersOne},
				two: {corners: cornersTwo},
			},
			command: {group, youth, women},
		} = param;

		/*const TM20 = list.reduce<number>((acc, x) => {
			if (x.under.handicap === 2.0 || x.under.handicap === 2) {
				acc = x.under.behind;
			}
			return acc;
		}, 0);*/
		// const excludeGroupChannel = this.groupForChannel.some(x => group.includes(x));
		const excludeGroupRate = this.groupForRate.some(x => group.includes(x));

		switch (param.strategy) {
			case 4:
				if (!excludeGroupRate) {
					if (women === 0 && youth === 0) {
						if (cornersTwo < 2 && cornersOne < 3) {
							if (1.6 <= TB15A && TB15A <= 2.4) {
								if (matchOddsP2 > 2) {
									await this.telegramService.sendMessageChat(decorateMessageChat(param));
									await this.fetchService.placeOrders({
										marketId,
										layOrBack: TB15A <= 1.9 ? 'lay' : 'back', // TODO lay "против" - back "за"
										choice: {
											selectionId: TB15A <= 1.9 ? over15SelectionId : under15SelectionId,
											handicap: TB15A <= 1.9 ? over15Handicap : under15Handicap,
										},
										bet: {
											price: TB15A <= 1.9 ? TB15A + 0.1 : TM15B - 0.2,
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
