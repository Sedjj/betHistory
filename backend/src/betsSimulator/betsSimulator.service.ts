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
			'Austrian Regionalliga',
			'Bangladesh',
			'Belarusian',
			'Belgian',
			'Bosnian',
			'Canadian',
			'Chilean Primera',
			'Chinese',
			'Colombian Primera A',
			'Costa Rican',
			'Czech 2 Liga',
			'Czech 3 Liga',
			'Egyptian Premier',
			'English',
			'Finnish Kakkonen',
			'French Ligue 1',
			'French Cup',
			'Georgian',
			'Regionalliga',
			'Hungarian',
			'Israeli',
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
			'Romanian Liga III',
			'Rwandan',
			'Scottish League',
			'Serbian',
			'South Korean Matches',
			'Swiss',
			'Thai',
			'UEFA',
			'Ukrainian',
			'Soccer',
		];
	}

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
								if (matchOddsP2 < 6.5) {
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
