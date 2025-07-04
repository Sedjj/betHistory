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

	constructor(
		private readonly telegramService: TelegramService,
		private readonly fetchService: FetchService,
	) {
		this.groupBlack = blackList();
		this.groupWhite = whiteList();
	}

	public async matchRate(param: Football) {
		const {
			rates: {
				matchOdds: {
					p2: {behind: matchOddsP2},
					p1: {behind: matchOddsP1},
					// x: {behind: matchOddsX},
				},
				overUnder15: {
					marketId,
					over: {against: TB15A, selectionId: over15SelectionId, handicap: over15Handicap},
					under: {behind: TM15B, selectionId: under15SelectionId, handicap: under15Handicap},
				},
				// goalLines: {list},
			},
			cards: {
				one: {corners: cornersOne},
			},
			command: {group, youth, women},
		} = param;

		// const TM20 = list.reduce<number>((acc, x) => {
		// 	if (x.under.handicap === 2.0 || x.under.handicap === 2) {
		// 		acc = x.under.behind;
		// 	}
		// 	return acc;
		// }, 0);

		const excludeWhiteGroup = this.groupWhite.some(x => group.includes(x));
		const excludeBlackGroup = this.groupBlack.some(x => group.includes(x));
		const mod = Math.abs(matchOddsP1 - matchOddsP2);

		switch (param.strategy) {
			case 4:
				if (women === 0 && youth === 0) {
					if (1.5 <= TB15A && TB15A <= 2) {
						if (mod > 0.35 && cornersOne > 0) {
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
				break;
			default:
				break;
		}
	}
}

function blackList(): string[] {
	return [
		'Belarusian Premier League',
		'Belgian',
		'Brazilian',
		'Canadian Championship',
		'Chilean Primera B',
		'Croatian 3. HNL',
		'Czech 2 Liga',
		'Danish 1st Division',
		'Danish Superliga',
		'Dutch Cup',
		'Dutch Playoffs',
		'Elite Friendlies',
		'English Premier League',
		'Faroe',
		'Fiji',
		'Finnish Kakkonen',
		'Finnish Ykkonen',
		'French Ligue 1',
		'Georgian',
		'German Bundesliga 2',
		'German Cup',
		'German Regionalliga Southwest',
		'Hong Kong',
		'Hungarian NB III',
		'Icelandic Cup',
		'Indian',
		'Irish',
		'Israeli',
		'Kenyan',
		'Mexican Liga MX',
		'Nicaraguan',
		'Norwegian',
		'Pakistan',
		'Paraguayan',
		'Polish',
		'Portuguese Segunda Liga',
		'Qatari',
		'Russian Cup',
		'Scottish League',
		'Serbian First League',
		'Singapore',
		'Slovakian',
		'South Korean Matches',
		'Spanish',
		'Swiss',
		'Thai Division 1',
		'Turkish',
		'US Lamar',
		'US Major ',
		'US Matches',
	];
}

function whiteList(): string[] {
	return ['Belgian Reserves', 'Brazilian Serie A', 'Spanish La Liga'];
}
