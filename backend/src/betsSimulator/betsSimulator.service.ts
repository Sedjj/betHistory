import {Injectable} from '@nestjs/common';
import {IFootball} from '../model/football/type/football.type';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChat} from '../utils/formateMessage';
import {betAmount} from '../store';
import {FetchService} from '../fetch/fetch.service';

@Injectable()
export class BetsSimulatorService {
	private groupBlack: string[];
	private groupWhite: string[];

	constructor(private readonly telegramService: TelegramService, private readonly fetchService: FetchService) {
		this.groupBlack = blackList();
		this.groupWhite = whiteList();
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
				goalLines: {list},
			},
			command: {group, youth, women},
		} = param;

		const TM20 = list.reduce<number>((acc, x) => {
			if (x.under.handicap === 2.0 || x.under.handicap === 2) {
				acc = x.under.behind;
			}
			return acc;
		}, 0);

		const excludeWhiteGroup = this.groupWhite.some(x => group.includes(x));
		const excludeBlackGroup = this.groupBlack.some(x => group.includes(x));
		const mod = Math.abs(matchOddsP1 - matchOddsP2);

		switch (param.strategy) {
			case 4:
				if (women === 0 && youth === 0) {
					if (1.45 < TB15A && TB15A < 2.1) {
						if (mod > 0.35 && matchOddsX > 2.7) {
							if (TM20 < 1.85) {
								if (excludeWhiteGroup || !excludeBlackGroup) {
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

function blackList(): string[] {
	return [
		'Argentinian',
		'Azerbaijan',
		'Bahraini Premier',
		'Bangalore',
		'Bangladesh',
		'Belarusian',
		'Belgian',
		'Brazilian',
		'Chilean',
		'Croatian 3. HNL',
		'Dutch Cup',
		'Egyptian',
		'English',
		'FIFA',
		'French Ligue 1',
		'Georgian',
		'German',
		'Honduras',
		'Indian',
		'Irish',
		'Israeli',
		'Italian',
		'Jordan',
		'Kakkonen',
		'Lithuanian A Lyga',
		'Mexican Ascenso MX',
		'Mongolian',
		'Nicaraguan',
		'Norwegian Eliteserien',
		'Pakistan',
		'Palestinian',
		'Paraguayan',
		'Peruvian',
		'Polish Cup',
		'Polish Ekstraklasa',
		'Portuguese',
		'Qatari Stars League',
		'Regionalliga',
		'Romanian Liga III',
		'Russian Cup',
		'Russian Reserves',
		'Rwandan',
		'Scottish',
		'Serbian First League',
		'Slovakian',
		'South Korean Matches',
		'Spanish',
		'Swiss',
		'Thai',
		'Turkish',
		'Ukrainian',
		'Welsh',
	];
}

function whiteList(): string[] {
	return [
		'Argentinian Superliga Cup',
		'Argentinian Torneo A',
		'Brazilian Campeonato',
		'Chilean Primera B',
		'English League 2',
		'Irish Division 1',
		'Portuguese Matches',
		'Scottish Championship',
		'Slovakian Super League',
		'Spanish La Liga',
	];
}
