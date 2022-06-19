import {Injectable} from '@nestjs/common';
import {TelegramService} from '../telegram/telegram.service';
import {decorateMessageChat} from '../utils/formateMessage';
import {betAmount} from '../store';
import {FetchService} from '../fetch/fetch.service';
import {Football} from '../model/football/schemas/football.schema';

@Injectable()
export class BetsSimulatorService {
	private groupBlack: string[];
	private groupWhite: string[];

	constructor(private readonly telegramService: TelegramService, private readonly fetchService: FetchService) {
		this.groupBlack = blackList();
		this.groupWhite = whiteList();
	}

	public async matchRate(param: Football) {
		const {
			rates: {
				matchOdds: {
					p2: {behind: matchOddsP2},
					p1: {behind: matchOddsP1},
					x: {behind: matchOddsX},
				},
				overUder15: {
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
							if (1.25 < TM20 && TM20 < 1.85) {
								if (matchOddsP1 > 1.7) {
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
				}
				break;
			default:
				break;
		}
	}
}

function blackList(): string[] {
	return [
		'Azerbaijan',
		'Bahraini Premier',
		'Bangalore',
		'Bangladesh',
		'Belgian First Division',
		'Bosnian',
		'Chilean Primera Division',
		'Colombian Matches',
		'Croatian 1 HNL',
		'Dutch Cup',
		'Egyptian Premier',
		'English Matches',
		'English Northern Division 1',
		'English Southern League Cup',
		'French Ligue 1',
		'Georgian',
		'German Bundesliga 2',
		'German Regional Cup',
		'Goiano',
		'Indian',
		'Irish FAI Cup',
		'Israeli',
		'Kakkonen',
		'Lithuanian A Lyga',
		'Maltese',
		'Mexican Ascenso MX',
		'Nicaraguan',
		'Norwegian Eliteserien',
		'Paraguayan Segunda',
		'Peruvian',
		'Polish Cup',
		'Polish Ekstraklasa',
		'Polish III Liga',
		'Portuguese',
		'Qatari Stars',
		'Regionalliga',
		'Reserves',
		'Romanian Liga III',
		'Russian Cup',
		'Russian Football National',
		'Rwandan',
		'Scottish League One',
		'Scottish League Two',
		'Slovakian 2 Liga',
		'South Korean Matches',
		'Spanish',
		'Sri Lankan',
		'Swiss',
		'Thai Division 1',
		'Turkish',
		'UEFA Champions League Qualifiers',
		'Ukrainian',
		'Welsh',
	];
}

function whiteList(): string[] {
	return ['Portuguese Matches', 'German Regionalliga West', 'Spanish La Liga'];
}
