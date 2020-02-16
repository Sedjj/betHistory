import {Injectable, Logger} from '@nestjs/common';
import {
	ICards,
	ICardsCommands,
	ICommand,
	IFootball,
	IMainRates,
	INameCommand,
	IOtherRates,
	IScore,
	ITimeSnapshot
} from '../football/type/football.type';
import {EventMarket, EventNodes, MarketNodes, Runners} from './type/parserFootball.type';
import moment from 'moment';

@Injectable()
export class ParserFootballService {
	private readonly logger = new Logger(ParserFootballService.name);

	public getIdList(item: any): string[] {
		let res: string[] = [];
		if (item['attachments'] && item['attachments']['markets']) {
			let marketsList: any[] = Object.values(item['attachments']['markets']);
			if (marketsList != null && marketsList.length) {
				res = marketsList.reduce((acc: string[], {marketId, marketTime, marketStatus, inplay}) => {
					if (inplay && marketStatus === 'OPEN') {
						if (marketTime != null) {
							let currentDate = moment((new Date()).toISOString());
							let openDate = moment(marketTime);
							let difference = currentDate.diff(openDate, 'seconds');
							if (difference >= 0) {
								acc.push(marketId);
							}
						}
					}
					return acc;
				}, [] as string[]);
			}
		}
		return res;
	}

	/**
	 * Метод для парсинга и создания объекта ставки.
	 *
	 * @param {EventNodes} item входной объект матча
	 */
	public getParams(item: EventNodes): IFootball {
		let param: IFootball;
		try {
			param = {
				marketIds: this.getMarketId(item.marketNodes),
				eventId: item.eventId,
				strategy: 0,
				time: this.getTimeGame(item.event),
				score: this.getScoreGame(item),
				command: this.getCommand(item.marketNodes),
				rates: this.getRates(item.marketNodes),
				cards: this.getCardsCommands(item),
				createdBy: new Date().toISOString(),
				modifiedBy: new Date().toISOString()
			};
		} catch (error) {
			this.logger.debug(`getParams: ${error}`);
			throw new Error(error);
		}
		return param;
	}

	/**
	 * Метод для определения идентификатора матча.
	 *
	 * @param {MarketNodes[]} market элементы рынка
	 */
	public getMarketId(market: MarketNodes[]): string {
		let res: string = '0';
		if (market != null && market.length) {
			market.forEach((node) => {
				if (node.marketId) {
					res = node.marketId;
				}
			});
		}
		return res;
	}

	/**
	 * Метод для определения текущго времени матча в секундах.
	 *
	 * @param {EventMarket} event название и дата начала события
	 */
	public getTimeGame(event: EventMarket): number {
		let res: number = 0;
		if (event != null && event.openDate != null) {
			let currentDate = moment((new Date()).toISOString());
			let openDate = moment(event.openDate);
			res = currentDate.diff(openDate, 'seconds');
		}
		return res;
	}

	/**
	 * Метод для определения счета матча.
	 *
	 * @param {EventNodes} item объект матча
	 */
	public getScoreGame(item: EventNodes): IScore {
		let rate: IScore = {
			sc1: 0,
			sc2: 0,
			resulting: '',
		};
		if (item['SC'] && item['SC']['FS']) {
			if (item['SC']['FS']['S1']) {
				rate.sc1 = item['SC']['FS']['S1'];
			}
			if (item['SC']['FS']['S2']) {
				rate.sc2 = item['SC']['FS']['S2'];
			}
		}
		return rate;
	}

	/**
	 * Метод для определения общей информации о команндах.
	 *
	 * @param {MarketNodes[]} market элементы рынка
	 */
	public getCommand(market: MarketNodes[]): ICommand {   // FIXME если у события 2 event то будет ошибка
		let res: ICommand = {
			ru: {
				one: '',
				two: '',
				group: ''
			},
			en: {
				one: '',
				two: '',
				group: ''
			},
			women: 0,
			youth: 0,
			limited: 0,
		};
		if (market != null && market.length) {
			market.forEach((node) => {
				let runners: Runners[] = node.runners;
				if (runners != null && runners.length) {
					res.en = this.getNameCommand(runners);
					if (res.en != null) {
						res.ru = res.en;
						res.women = this.parserWomenTeam(res.en.one);
						res.youth = this.parserYouthTeam(res.en.one);
						res.limited = this.parserLimitedTeam(res.en.one);
					}
				}
			});
		}
		return res;
	}

	/**
	 * Метод для парсинга названия команд и лиги.
	 *
	 * @param {Runners[]} runners информаия о команждах
	 */
	public getNameCommand(runners: Runners[]): INameCommand {
		let res: INameCommand = {
			one: '',
			two: '',
			group: ''
		};
		if (runners != null && runners.length) {
			runners.forEach((node: Runners, index: number) => {
				switch (index) {
					case 0: {
						let {description} = node;
						if (description && description.runnerName) {
							res.one = description.runnerName;
						}
						break;
					}
					case 1: {
						let {description} = node;
						if (description && description.runnerName) {
							res.two = description.runnerName;
						}
						break;
					}
				}
			});
		}
		return res;
	}

	/**
	 * Метод для нахождения женских команд.
	 *
	 * @param {String} value строка для парсинга
	 */
	public parserWomenTeam(value: string): number {
		let parserReturn: RegExpMatchArray | null = null;
		if (value && value.length > 5) {
			parserReturn = value.match(/(?!=\s)\(Women\)/ig);
		}
		return parserReturn != null ? 1 : 0;
	}

	/**
	 * Метод для нахождения молодежных команд.
	 *
	 * @param {String} value строка для парсинга
	 */
	public parserYouthTeam(value: string): number {
		let parserReturn: RegExpMatchArray | null = null;
		if (value && value.length > 5) {
			parserReturn = value.match(/(?!=\s)U\d{2}/ig);
		}
		return parserReturn != null ? 1 : 0;
	}

	/**
	 * Метод для нахождения ограниченных команд.
	 *
	 * @param {String} value строка для парсинга
	 */
	public parserLimitedTeam(value: string): number {
		let parserReturn: RegExpMatchArray | null = null;
		if (value && value.length > 5) {
			parserReturn = value.match(/^\s?[\s?2\s?|\s?3\s?|\s?4\s?|\s?5\s?|\s?6\s?|\s?7\s?|\s?8\s?|\s?9\s?]\s?[х|x][\s?2\s?|\s?3\s?|\s?4\s?|\s?5\s?|\s?6\s?|\s?7\s?|\s?8\s?|\s?9\s?]\s?./ig);
		}
		return parserReturn != null ? 1 : 0;
	}

	/**
	 * Метод для определения коэффициентов для ставки.
	 *
	 * @param {MarketNodes[]} market элементы рынка
	 */
	public getRates(market: MarketNodes[]): ITimeSnapshot {
		let res: ITimeSnapshot = {
			/*index: 1,*/
			mainRates: {
				behind: {
					p1: 0,
					x: 0,
					p2: 0,
					mod: 0,
				},
				against: {
					p1: 0,
					x: 0,
					p2: 0,
					mod: 0,
				}
			},
			underOneAndHalf: {
				behind: {
					p1: 0,
					x: 0,
					p2: 0,
					mod: 0,
				},
				against: {
					p1: 0,
					x: 0,
					p2: 0,
					mod: 0,
				}
			},
			underTwoAndHalf: {
				behind: {
					p1: 0,
					p2: 0,
				},
				against: {
					p1: 0,
					p2: 0,
				}
			},
			bothScoreYes: {
				behind: {
					p1: 0,
					p2: 0,
				},
				against: {
					p1: 0,
					p2: 0,
				}
			},
			bothScoreNo: {
				behind: {
					p1: 0,
					p2: 0,
				},
				against: {
					p1: 0,
					p2: 0,
				}
			},
			asianHandicap: {
				behind: {
					p1: 0,
					p2: 0,
				},
				against: {
					p1: 0,
					p2: 0,
				}
			},
		};
		if (market != null && market.length) {
			market.forEach((node) => {
				let runners: Runners[] = node.runners;
				if (runners != null && runners.length) {
					res.mainRates = this.parserMainRates(runners);
				}
			});
		}
		return res;
		/*return {
			underOneAndHalf: this.parserMainRates(),
			underTwoAndHalf: this.parserOtherRates(),
			bothScoreYes: this.parserOtherRates(),
			bothScoreNo: this.parserOtherRates(),
			asianHandicap: this.parserOtherRates(),
		};*/
	}

	/**
	 * Метод для определения состояние основных коэффициентов во время отбора
	 *
	 * @param {Runners[]} runners информаия о команждах
	 */
	public parserMainRates(runners: Runners[]): IMainRates {
		let res: IMainRates = {
			behind: {
				p1: 0,
				x: 0,
				p2: 0,
				mod: 0,
			},
			against: {
				p1: 0,
				x: 0,
				p2: 0,
				mod: 0,
			}
		};
		if (runners != null && runners.length) {
			runners.forEach((node: Runners, index: number) => {
				switch (index) {
					case 0: { // p1
						let {exchange} = node;
						if (exchange && exchange.availableToBack && exchange.availableToBack.length) {
							if (exchange.availableToBack[0].price) {
								res.behind.p1 = exchange.availableToBack[0].price;
							}
						}
						if (exchange && exchange.availableToLay && exchange.availableToLay.length) {
							if (exchange.availableToLay[0].price) {
								res.against.p1 = exchange.availableToLay[0].price;
							}
						}
						break;
					}
					case 1: {  // p2
						let {exchange} = node;
						if (exchange && exchange.availableToBack && exchange.availableToBack.length) {
							if (exchange.availableToBack[0].price) {
								res.behind.p2 = exchange.availableToBack[0].price;
							}
						}
						if (exchange && exchange.availableToLay && exchange.availableToLay.length) {
							if (exchange.availableToLay[0].price) {
								res.against.p2 = exchange.availableToLay[0].price;
							}
						}
						break;
					}
					case 2: { // ничья
						let {exchange} = node;
						if (exchange && exchange.availableToBack && exchange.availableToBack.length) {
							if (exchange.availableToBack[0].price) {
								res.behind.x = exchange.availableToBack[0].price;
							}
						}
						if (exchange && exchange.availableToLay && exchange.availableToLay.length) {
							if (exchange.availableToLay[0].price) {
								res.against.x = exchange.availableToLay[0].price;
							}
						}
						break;
					}
				}
			});
			res.behind.mod = Math.abs(res.behind.p1 - res.behind.p2);
			res.against.mod = Math.abs(res.against.p1 - res.against.p2);
		}
		return res;
	}

	/**
	 * Метод для определения состояние остальных коэффициентов во время отбора
	 */
	public parserOtherRates(): IOtherRates {
		return {
			behind: {
				p1: 0,
				p2: 0,
			},
			against: {
				p1: 0,
				p2: 0,
			}
		};
	}

	/**
	 * Метод для определения общей информаци о картах.
	 *
	 * @param item
	 */
	public getCardsCommands(item: object): ICardsCommands {
		return {
			one: this.getCards(item),
			two: this.getCards(item),
		};
	}

	/**
	 * Метод для определения карты команды.
	 *
	 * @param item
	 */
	public getCards(item: object): ICards {
		return {
			red: 0,
			attacks: 0,
			danAttacks: 0,
			shotsOn: 0,
			shotsOff: 0,
		};
	}
}