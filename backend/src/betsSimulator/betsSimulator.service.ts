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
			'Azerbaijan',
			'Bahraini Premier',
			'Bangladesh Premier',
			'Belgian First Division A',
			'Bulgarian Cup',
			'CONMEBOL Copa Libertadores',
			'Costa Rican',
			'Croatian',
			'Czech Cup',
			'Danish',
			'Ecuadorian',
			'EFL Trophy',
			'Egyptian',
			'English Championship',
			'English League 1',
			'English Premier League',
			'Estonian Cup',
			'FIFA',
			'Finnish',
			'French',
			'Friend',
			'Georgian',
			'German',
			'Greek',
			'Guatemalan Liga Nacional',
			'Hungarian Cup',
			'Icelandic',
			'Israeli',
			'Irish Premier Division',
			'Italian',
			'Kazakhstan',
			'Latvian',
			'Malaysian Super League',
			'Malian',
			'Mexican Ascenso',
			'Moldovan',
			'New Zealand',
			'Nicaraguan',
			'Northern Irish',
			'Palestinian',
			'Paraguayan',
			'Peruvian',
			'Portuguese',
			'Qatari',
			'Romanian Liga III',
			'Russian Premier League',
			'Scottish',
			'Serbian',
			'Slovakian 2 Liga',
			'Swedish Cup',
			'Swiss',
			'Spanish',
			'Taiwanese',
			'Thai Cup',
			'Tunisian',
			'UEFA',
			'Ukrainian',
			'US Major',
			'Uruguayan',
			'Turkish',
		];
	}

	public async matchRate(param: IFootball) {
		const {
			rates: {
				matchOdds: {
					p1: {behind: matchOddsP1},
					p2: {behind: matchOddsP2},
					x: {behind: matchOddsX},
				},
				overUnder25: {
					over: {/*behind: TB25B,*/ against: TB25A},
					/*totalMatched,*/
				},
				overUnder15: {
					marketId,
					over: {against: TB15A, selectionId: overSelectionId, handicap: overHandicap},
					under: {behind: TM15B, selectionId: underSelectionId, handicap: underHandicap},
				},
				bothTeamsToScore: {
					no: {behind: bothNo},
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
		const mod = matchOddsP2 - matchOddsP1;

		switch (param.strategy) {
			case 4:
				if (!excludeGroupRate) {
					if (cornersOne < 5 && cornersTwo < 5) {
						if (youth === 0 && women === 0) {
							if (TB25A < 6 && TB15A <= 2.4) {
								if (2 < matchOddsX) {
									if (-6.5 < mod && mod < 4.3) {
										if (0 < bothNo && bothNo < 1.8) {
											await this.telegramService.sendMessageChat(decorateMessageChat(param));
											await this.fetchService.placeOrders({
												marketId,
												layOrBack: TB15A < 1.55 ? 'lay' : 'back', // TODO lay "против" - back "за"
												choice: {
													selectionId: TB15A < 1.55 ? overSelectionId : underSelectionId,
													handicap: TB15A < 1.55 ? overHandicap : underHandicap,
												},
												bet: {
													price: TB15A < 1.55 ? TB15A + 0.1 : TM15B - 0.2,
													stake: betAmount.bets,
												},
											});
										}
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
