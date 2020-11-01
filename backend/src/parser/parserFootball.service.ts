import {Injectable, Logger} from '@nestjs/common';
import {
	ICards,
	ICardsCommands,
	ICommand,
	IFootball,
	IMainRates,
	IOtherRates,
	IOtherRatesInArray,
	IScore,
	ITimeSnapshot,
} from '../model/football/type/football.type';
import moment from 'moment';
import {EventDetails, StateEventDetails, TeamInfoEventDetails} from './type/eventDetails.type';
import {LiteMarkets, MarketType} from './type/marketsEvents.type';
import {ExchangeMarketNodes, MarketNodes, RunnersMarketNodes, StatusMarket} from './type/byMarket.type';
import {ScoreEvents} from './type/scoreEvents.type';

@Injectable()
export class ParserFootballService {
	private readonly logger = new Logger(ParserFootballService.name);

	private choiceMarketType: MarketType[] = [
		'MATCH_ODDS',
		'OVER_UNDER_15',
		'OVER_UNDER_25',
		'BOTH_TEAMS_TO_SCORE',
		'ALT_TOTAL_GOALS',
	];

	public static initRates(count: number): ITimeSnapshot {
		let rate: IMainRates = {
			selectionId: 0,
			marketId: '',
			status: StatusMarket.CLOSE,
			handicap: 0,
			behind: {
				p1: count,
				x: count,
				p2: count,
				mod: count,
			},
			against: {
				p1: count,
				x: count,
				p2: count,
				mod: count,
			},
		};
		let rateOther: IOtherRates = {
			selectionId: 0,
			marketId: '',
			status: StatusMarket.CLOSE,
			handicap: 0,
			behind: count,
			against: count,
		};
		let rateOtherInArray: IOtherRatesInArray = {
			selectionId: 0,
			marketId: '',
			status: StatusMarket.CLOSE,
			list: [],
		};
		return {
			matchOdds: rate,
			under15: rateOther,
			under25: rateOther,
			bothTeamsToScoreYes: rateOther,
			bothTeamsToScoreNo: rateOther,
			allTotalGoals: rateOtherInArray,
		};
	}

	private static behindParser(exchange?: ExchangeMarketNodes): number {
		let behind: number = 0;
		if (
			exchange &&
			exchange.availableToBack &&
			Array.isArray(exchange.availableToBack) &&
			exchange.availableToBack.length
		) {
			behind = Math.max.apply(
				Math,
				exchange.availableToBack.map(o => (o.price ? o.price : 0)),
			);
		}
		return behind;
	}

	private static againstParser(exchange?: ExchangeMarketNodes): number {
		let against: number = 0;
		if (
			exchange &&
			exchange.availableToLay &&
			Array.isArray(exchange.availableToLay) &&
			exchange.availableToLay.length
		) {
			against = Math.min.apply(
				Math,
				exchange.availableToLay.map(o => (o.price ? o.price : 0)),
			);
		}
		return against;
	}

	private static round(handicap: number | undefined): number {
		let num = 0;
		if (handicap && handicap !== 0.0) {
			return handicap;
		}
		return num;
	}

	/**
	 * Метод для поиска матчей которые начались или только закончились.
	 *
	 * @param item входные данные с сервера
	 */
	public getIdList(item: any): number[] {
		let res: number[] = [];
		if (item['attachments'] && item['attachments']['markets']) {
			let marketsList: any[] = Object.values(item['attachments']['markets']);
			if (marketsList != null && marketsList.length) {
				res = marketsList.reduce((acc: number[], {eventId, marketTime, marketStatus, inplay}) => {
					if (inplay && (marketStatus === StatusMarket.OPEN || marketStatus === StatusMarket.SUSPENDED)) {
						if (marketTime != null) {
							let currentDate = moment(new Date().toISOString());
							let openDate = moment(marketTime);
							let difference = currentDate.diff(openDate, 'seconds');
							if (difference >= 0) {
								acc.push(eventId);
							}
						}
					}
					acc.push(eventId);
					return acc;
				}, res);
			}
		}
		return res;
	}

	/**
	 * Метод для создания объекта с информацией о markets в событии.
	 *
	 * @param item входные данные с сервера
	 */
	public getMarketsEvents(item: any): LiteMarkets {
		let res: LiteMarkets = {};
		if (item['attachments'] && item['attachments']['liteMarkets']) {
			let liteMarkets: any[] = Object.values(item['attachments']['liteMarkets']);
			if (liteMarkets != null && liteMarkets.length) {
				res = liteMarkets.reduce((acc, {marketId, eventId, marketType}) => {
					if (this.choiceMarketType.some(type => type === marketType)) {
						if (!acc[eventId]) {
							acc[eventId] = [marketId];
						} else {
							if (acc[eventId].some((x: string) => x !== marketId)) {
								acc[eventId].push(marketId);
							}
						}
					}
					return acc;
				}, res);
			}
		}
		return res;
	}

	/**
	 * Метод для получения всех бирж события.
	 *
	 * @param item входные данные с сервера
	 */
	public getMarketNodes(item: any): MarketNodes[] {
		let res: MarketNodes[] = [];
		if (item['eventTypes'] && Array.isArray(item['eventTypes']) && item['eventTypes'].length) {
			let eventTypes = item['eventTypes'][0];
			if (eventTypes['eventNodes'] && Array.isArray(eventTypes['eventNodes']) && eventTypes['eventNodes'].length) {
				let eventNodes = eventTypes['eventNodes'][0];
				if (eventNodes['marketNodes'] && Array.isArray(eventNodes['marketNodes']) && eventNodes['marketNodes'].length) {
					res = eventNodes['marketNodes'];
				}
			}
		}
		return res;
	}

	/**
	 * Метод для определения результата матча.
	 *
	 * @param {EventDetails[]} scoreEvents входные данные с сервера
	 */
	public getScoreEvents(scoreEvents: EventDetails[]): ScoreEvents[] {
		return scoreEvents.reduce<ScoreEvents[]>((acc, item) => {
			if (item.state != null && item.state.score != null) {
				let {home, away} = item.state.score;
				if (home != null && away != null) {
					acc.push({
						eventId: item.state.eventId,
						marketId: item.marketId,
						resulting: `${home.score}:${away.score}`,
					});
				}
			}
			return acc;
		}, []);
	}

	/**
	 * Метод для парсинга и создания объекта ставки.
	 *
	 * @param {EventDetails} item входной объект события
	 */
	public getParams(item: EventDetails): IFootball {
		let param: IFootball;
		try {
			param = {
				marketId: item.marketId || '',
				eventId: item.eventId || 0,
				strategy: 0,
				time: this.getTimeGame(item.state),
				score: this.getScoreGame(item.state),
				command: this.getCommand(item),
				rates: this.getRates(item.marketNodes),
				cards: this.getCardsCommands(item.state),
				createdBy: new Date().toISOString(),
				modifiedBy: new Date().toISOString(),
			};
		} catch (error) {
			this.logger.debug(`getParams: ${error}`);
			throw new Error(error);
		}
		return param;
	}

	/**
	 * Метод для определения текущго времени матча в секундах.
	 *
	 * @param {StateEventDetails} event объект события
	 */
	public getTimeGame(event?: StateEventDetails): number {
		let res: number = 0;
		if (event != null && event.timeElapsed != null) {
			res = event.timeElapsed;
		}
		return res;
	}

	/**
	 * Метод для определения счета матча.
	 *
	 * @param {StateEventDetails} event объект события
	 */
	public getScoreGame(event?: StateEventDetails): IScore {
		let rate: IScore = {
			sc1: 0,
			sc2: 0,
			resulting: '',
		};
		if (event != null && event.score != null) {
			let {home, away} = event.score;
			if (home != null && home.score != null) {
				let scoreHome: string = home.score;
				if (typeof scoreHome === 'string' && scoreHome !== '') {
					rate.sc1 = parseInt(scoreHome, 10);
				}
			}
			if (away != null && away.score != null) {
				let scoreAway: string = away.score;
				if (typeof scoreAway === 'string' && scoreAway !== '') {
					rate.sc2 = parseInt(scoreAway, 10);
				}
			}
		}
		return rate;
	}

	/**
	 * Метод для определения общей информации о команндах.
	 *
	 * @param {EventDetails} eventDetails объект события
	 */
	public getCommand(eventDetails: EventDetails): ICommand {
		let res: ICommand = {
			one: '',
			two: '',
			group: '',
			women: 0,
			youth: 0,
			limited: 0,
		};
		if (eventDetails != null && eventDetails.homeName) {
			res.one = eventDetails.homeName;
		}
		if (eventDetails != null && eventDetails.awayName) {
			res.two = eventDetails.awayName;
		}
		if (eventDetails != null && eventDetails.competitionName) {
			res.group = eventDetails.competitionName;
		}
		res.women = this.parserWomenTeam(res.one);
		res.youth = this.parserYouthTeam(res.one);
		res.limited = this.parserLimitedTeam(res.one);
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
			parserReturn = value.match(/(?!=\s)\(Women\)|\(W\)/gi);
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
			parserReturn = value.match(/(?!=\s)U\d{2}/gi);
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
			parserReturn = value.match(
				/\s?[\s?2\s?|\s?3\s?|\s?4\s?|\s?5\s?|\s?6\s?|\s?7\s?|\s?8\s?|\s?9\s?]\s?[х|x][\s?2\s?|\s?3\s?|\s?4\s?|\s?5\s?|\s?6\s?|\s?7\s?|\s?8\s?|\s?9\s?]\s?/gi,
			);
		}
		return parserReturn != null ? 1 : 0;
	}

	/**
	 * Метод для определения общей информаци о картах.
	 *
	 * @param {StateEventDetails} state объект события
	 */
	public getCardsCommands(state?: StateEventDetails): ICardsCommands {
		return {
			one: state && state.score ? this.getCards(state.score.home) : this.getCards(),
			two: state && state.score ? this.getCards(state.score.away) : this.getCards(),
		};
	}

	/**
	 * Метод для определения карты команды.
	 *
	 * @param {TeamInfoEventDetails} teamInfo детальная информация о команде
	 */
	public getCards(teamInfo?: TeamInfoEventDetails): ICards {
		let res: ICards = {
			red: 0,
			yellow: 0,
			corners: 0,
			attacks: 0,
			danAttacks: 0,
			shotsOn: 0,
			shotsOff: 0,
		};
		if (teamInfo != null && teamInfo.numberOfRedCards) {
			res.red = teamInfo.numberOfRedCards;
		}
		if (teamInfo != null && teamInfo.numberOfYellowCards) {
			res.yellow = teamInfo.numberOfYellowCards;
		}
		if (teamInfo != null && teamInfo.numberOfCorners) {
			res.corners = teamInfo.numberOfCorners;
		}
		return res;
	}

	/**
	 * Метод для определения коэффициентов для ставки.
	 *
	 * @param {MarketNodes[]} market элементы рынка
	 */
	public getRates(market?: MarketNodes[]): ITimeSnapshot {
		let res: ITimeSnapshot = ParserFootballService.initRates(0);
		if (market != null && market.length) {
			market.forEach(node => {
				let {description, runners, marketId, state} = node;
				if (description && runners != null && runners.length) {
					switch (description.marketType) {
						case 'MATCH_ODDS':
							res.matchOdds = this.parserMainRates(runners);
							res.matchOdds.marketId = marketId || '';
							res.matchOdds.status = state?.status || StatusMarket.CLOSE;
							break;
						case 'OVER_UNDER_15':
							res.under15 = this.parserOtherRates(runners, 'Under 1.5 Goals');
							res.under15.marketId = marketId || '';
							res.under15.status = state?.status || StatusMarket.CLOSE;
							break;
						case 'OVER_UNDER_25':
							res.under25 = this.parserOtherRates(runners, 'Under 2.5 Goals');
							res.under25.marketId = marketId || '';
							res.under25.status = state?.status || StatusMarket.CLOSE;
							break;
						case 'BOTH_TEAMS_TO_SCORE':
							res.bothTeamsToScoreYes = this.parserOtherRates(runners, 'Yes');
							res.bothTeamsToScoreYes.marketId = marketId || '';
							res.bothTeamsToScoreYes.status = state?.status || StatusMarket.CLOSE;

							res.bothTeamsToScoreNo = this.parserOtherRates(runners, 'No');
							res.bothTeamsToScoreNo.marketId = marketId || '';
							res.bothTeamsToScoreNo.status = state?.status || StatusMarket.CLOSE;
							break;
						case 'ALT_TOTAL_GOALS':
							res.allTotalGoals = this.parserOtherRatesInArray(runners, 'Under');
							res.allTotalGoals.marketId = marketId || '';
							res.allTotalGoals.status = state?.status || StatusMarket.CLOSE;
							break;
					}
				}
			});
		}
		return res;
	}

	/**
	 * Метод для определения состояние основных коэффициентов во время отбора
	 *
	 * @param {RunnersMarketNodes[]} runners информация о командах
	 */
	public parserMainRates(runners: RunnersMarketNodes[]): IMainRates {
		let initRates: ITimeSnapshot = ParserFootballService.initRates(0);
		let res: IMainRates = initRates.matchOdds;
		if (runners != null && runners.length) {
			runners.forEach((runner: RunnersMarketNodes, index: number) => {
				let {exchange} = runner;
				// FIXME нужно придумать другую структуру хранения чтоб собирать эти данные
				// res.selectionId = runner.selectionId || 0;
				// res.handicap = ParserFootballService.round(runner.handicap);
				switch (index) {
					case 0: {
						// p1
						res.behind.p1 = ParserFootballService.behindParser(exchange);
						res.against.p1 = ParserFootballService.againstParser(exchange);
						break;
					}
					case 1: {
						// p2
						res.behind.p2 = ParserFootballService.behindParser(exchange);
						res.against.p2 = ParserFootballService.againstParser(exchange);
						break;
					}
					case 2: {
						// ничья
						res.behind.x = ParserFootballService.behindParser(exchange);
						res.against.x = ParserFootballService.againstParser(exchange);
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
	public parserOtherRates(runners: RunnersMarketNodes[], runnerName: string): IOtherRates {
		let initRates: ITimeSnapshot = ParserFootballService.initRates(0);
		let res: IOtherRates = initRates.under15;
		if (runners != null && runners.length) {
			runners.forEach((runner: RunnersMarketNodes) => {
				let {exchange, description} = runner;
				if (description && description.runnerName === runnerName) {
					res.selectionId = runner.selectionId || 0;
					res.handicap = ParserFootballService.round(runner.handicap);
					res.behind = ParserFootballService.behindParser(exchange);
					res.against = ParserFootballService.againstParser(exchange);
				}
			});
		}
		return res;
	}

	/**
	 * Метод для определения состояние остальных коэффициентов во время отбора с большим числом вариантов
	 */
	public parserOtherRatesInArray(runners: RunnersMarketNodes[], runnerName: string): IOtherRatesInArray {
		let initRates: ITimeSnapshot = ParserFootballService.initRates(0);
		let res: IOtherRatesInArray = initRates.allTotalGoals;
		if (runners != null && runners.length) {
			runners.forEach((runner: RunnersMarketNodes) => {
				let {exchange, description} = runner;
				if (description && description.runnerName === runnerName) {
					res.selectionId = runner.selectionId || 0;
					res.list.push({
						handicap: ParserFootballService.round(runner.handicap),
						behind: ParserFootballService.behindParser(exchange),
						against: ParserFootballService.againstParser(exchange),
					});
				}
			});
		}
		return res;
	}
}
