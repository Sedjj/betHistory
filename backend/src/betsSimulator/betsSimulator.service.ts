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
			'Panamanian',
			'Jordanian',
			'Israeli',
			'Hungarian NB II',
			'Greek Super League 2',
			'Georgian',
			'Ecuadorian Serie A',
			'Argentinian Primera',
		];
		this.groupForRate = [
			'AFC',
			'Argentinian',
			'Azerbaijan',
			'Bahraini',
			'Bangladesh',
			'Belarusian 1st Division',
			'Bosnian',
			'Belgian',
			'Goiano',
			'Gaucho',
			'Ecuadorian',
			'Egyptian',
			'Estonian',
			'FIFA',
			'English National',
			'English Premier',
			'French Ligue 2',
			'Friendly',
			'Georgian',
			'German',
			'Greek',
			'Guatemalan',
			'Israeli',
			'Irish',
			'Italian Serie B',
			'Italian Serie C',
			'Japanese J League 3',
			'Jordanian',
			'Kazakhstan',
			'Latvian',
			'Lithuanian',
			'Malaysian Super League',
			'Mexican Ascenso MX',
			'Nicaraguan',
			'Palestinian',
			'Paraguayan',
			'Peruvian',
			'Salvadoran',
			'Scottish',
			'Spanish',
			'Swiss',
			'Swedish',
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
					// x: {behind: matchOddsX},
				},
				overUnder25: {
					/*over: {behind: TB25B, against: TB25A},*/
					totalMatched,
				},
				overUnder15: {
					marketId,
					over: {against: TB15A, selectionId: over15SelectionId, handicap: over15Handicap},
					under: {behind: TM15B, selectionId: under15SelectionId, handicap: under15Handicap},
				},
				goalLines: {list},
				bothTeamsToScore: {
					yes: {behind: bothYes},
					no: {behind: bothNo},
				},
			},
			cards: {
				one: {corners: cornersOne},
				// two: {corners: cornersTwo},
			},
			command: {group, youth, women},
		} = param;

		const TM20 = list.reduce<number>((acc, x) => {
			if (x.under.handicap === 2.0 || x.under.handicap === 2) {
				acc = x.under.behind;
			}
			return acc;
		}, 0);
		const excludeGroupChannel = this.groupForChannel.some(x => group.includes(x));
		const excludeGroupRate = this.groupForRate.some(x => group.includes(x));

		switch (param.strategy) {
			case 2:
				if (!excludeGroupChannel) {
					if (women === 0 && 2.4 <= TM20) {
						if (1.1 <= bothNo && bothNo <= 2.2) {
							if (bothYes < 1.9) {
								await this.telegramService.sendMessageChannel(decorateMessageChannel(param));
								await this.telegramService.sendMessageChannel('ТБ2.5');
							}
						}
					}
				}
				break;
			case 4:
				if (!excludeGroupRate) {
					if (women === 0 && youth === 0) {
						if (0 < cornersOne && cornersOne < 3) {
							if (TB15A <= 2.4 && TM20 <= 1.45) {
								if (2 <= matchOddsP2 && matchOddsP2 <= 8) {
									if (totalMatched > 350) {
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
				}
				break;
			default:
				break;
		}
	}
}
