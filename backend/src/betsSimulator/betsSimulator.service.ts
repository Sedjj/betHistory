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
			'Bahraini',
			'Bangladesh',
			'Belgian',
			'Canadian',
			'Chilean Primera Division',
			'Chinese League 1',
			'Colombian',
			'Costa Rican',
			'Czech 2 Liga',
			'Czech 3 Liga',
			'Danish Cup',
			'Dutch Cup',
			'EFL Trophy',
			'Egyptian Premier',
			'English',
			'FIFA',
			'Finnish Cup',
			'Finnish Kakkonen',
			'French Ligue 1',
			'Georgian',
			'Israeli',
			'Italian',
			'Latvian',
			'Lithuanian',
			'Malaysian Super League',
			'Maltese',
			'Mexican Ascenso MX',
			'Nicaraguan',
			'Norwegian Eliteserien',
			'Paraguayan',
			'Peruvian',
			'Polish',
			'Portuguese Segunda',
			'Qatari',
			'Regionalliga',
			'Romanian Liga III',
			'Russian Football National',
			'Rwandan',
			'Scottish',
			'Slovakian 2 Liga',
			'Soccer',
			'South Korean K League 1',
			'South Korean Matches',
			'Swiss',
			'Thai',
			'UEFA',
			'Ukrainian',
			'Uruguayan',
		];
	}
	//bothTeamsToScoreYes: statistic.rates.bothTeamsToScore.yes.behind,
	public async matchRate(param: IFootball) {
		const {
			rates: {
				matchOdds: {
					p2: {behind: matchOddsP2},
					p1: {behind: matchOddsP1},
					x: {behind: matchOddsX},
				},
				overUnder15: {
					marketId,
					over: {against: TB15A, selectionId: over15SelectionId, handicap: over15Handicap},
					under: {behind: TM15B, selectionId: under15SelectionId, handicap: under15Handicap},
				},
				bothTeamsToScore: {
					yes: {behind: bothYes},
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
						if (cornersOne < 4 && TB15A < 2.1) {
							if (0.35 < mod && matchOddsX < 3.4) {
								if (bothYes <= 3) {
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
				}
				break;
			default:
				break;
		}
	}
}
