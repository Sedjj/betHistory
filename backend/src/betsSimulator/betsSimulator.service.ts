import {Injectable} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChat} from '../utils/formateMessage';
import {betAmount} from '../store';
import {FetchService} from '../fetch/fetch.service';

@Injectable()
export class BetsSimulatorService {
	private groupForRate: string[];

	constructor(private readonly telegramService: TelegramService, private readonly fetchService: FetchService) {
		this.groupForRate = [
			'Austrian Bundesliga',
			'Azerbaijan',
			'Bahraini',
			'Bangladesh',
			'Belarusian',
			'Belgian',
			'Brazilian Serie B',
			'Canadian',
			'Chilean Primera Division',
			'Croatian',
			'Cup',
			'Czech 2 Liga',
			'EFL Trophy',
			'Egyptian Premier',
			'English',
			'Finnish',
			'French Ligue 1',
			'Georgian',
			'German',
			'Goiano',
			'Honduras',
			'Israeli',
			'Italian',
			'Latvian',
			'Lithuanian',
			'Maltese Premier League',
			'Mexican Ascenso MX',
			'Nicaraguan',
			'Norwegian Eliteserien',
			'Paraguayan',
			'Peruvian',
			'Polish',
			'Qatari',
			'Regionalliga',
			'Rwandan',
			'Scottish',
			'Slovakian 2 Liga',
			'Soccer',
			'South Korean K League 1',
			'South Korean Matches',
			'Spanish Segunda',
			'Swiss',
			'Thai',
			'Turkish',
			'UEFA',
			'Ukrainian',
			'Uruguayan',
			'Welsh',
		];
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				matchOdds: {
					p2: {behind: matchOddsP2},
					p1: {behind: matchOddsP1},
				},
				overUnder15: {
					marketId,
					over: {against: TB15A, selectionId: over15SelectionId, handicap: over15Handicap},
					under: {behind: TM15B, selectionId: under15SelectionId, handicap: under15Handicap},
				},
			},
			cards: {
				one: {corners: cornersOne},
			},
			command: {group, youth, women},
		} = param;

		const excludeGroupRate = this.groupForRate.some(x => group.includes(x));
		const mod = Math.abs(matchOddsP1 - matchOddsP2);

		switch (param.strategy) {
			case 4:
				if (!excludeGroupRate) {
					if (women === 0 && youth === 0) {
						if (TB15A < 2.1 && TB15A > 1.5) {
							if (0.35 < mod && cornersOne < 5) {
								await this.telegramService.sendMessageChat(decorateMessageChat(param));
								await this.fetchService.placeOrders({
									marketId,
									layOrBack: TB15A <= 1.45 ? 'lay' : 'back', // TODO lay "против" - back "за"
									choice: {
										selectionId: TB15A <= 1.45 ? over15SelectionId : under15SelectionId,
										handicap: TB15A <= 1.45 ? over15Handicap : under15Handicap,
									},
									bet: {
										price: TB15A <= 1.45 ? TB15A + 0.1 : TM15B - 0.2,
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
