import {Injectable, Logger} from '@nestjs/common';
import {
	IBothTeamsToScore,
	ICards,
	ICardsCommands,
	ICommand,
	IFootball,
	IMatchOdds,
	IOverUnderRates,
	IGoalLines,
	IScore,
	ITimeSnapshot,
	IOverUnder,
	IYesNo,
	IOtherRate,
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
		let rate: IMatchOdds = {
			selectionId: 0,
			marketId: '',
			status: StatusMarket.CLOSE,
			totalMatched: 0,
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
		let overUnder: IOverUnder = {
			over: count,
			under: count,
		};
		let yesNo: IYesNo = {
			yes: count,
			no: count,
		};
		let overUnderRates: IOverUnderRates = {
			selectionId: 0,
			marketId: '',
			status: StatusMarket.CLOSE,
			totalMatched: 0,
			handicap: 0,
			behind: overUnder,
			against: overUnder,
		};
		let bothTeamsToScore: IBothTeamsToScore = {
			selectionId: 0,
			marketId: '',
			status: StatusMarket.CLOSE,
			totalMatched: 0,
			handicap: 0,
			behind: yesNo,
			against: yesNo,
		};
		let rateOtherInArray: IGoalLines = {
			selectionId: 0,
			marketId: '',
			status: StatusMarket.CLOSE,
			totalMatched: 0,
			list: [],
		};
		return {
			matchOdds: rate,
			overUnder15: overUnderRates,
			overUnder25: overUnderRates,
			bothTeamsToScore,
			goalLines: rateOtherInArray,
		};
	}

	public static initOtherRate(count: number): IOtherRate {
		return {
			handicap: 0,
			behind: {
				under: count,
				over: count,
			},
			against: {
				under: count,
				over: count,
			},
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

	private static roundHandicap(handicap: number | undefined): number {
		let num = 0;
		if (handicap && handicap !== 0.0) {
			return handicap;
		}
		return num;
	}

	private static roundNumber(value: number, decimals: number): number {
		return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
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
	 * Метод для определения текущего времени матча в секундах.
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
	 * Метод для определения общей информации о командах.
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
	 * Метод для определения общей информации о картах.
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
							res.matchOdds.totalMatched = ParserFootballService.roundNumber(state?.totalMatched || 0, 2);
							break;
						case 'OVER_UNDER_15':
							res.overUnder15 = this.parserOverUnderRates(runners, '1.5');
							res.overUnder15.marketId = marketId || '';
							res.overUnder15.status = state?.status || StatusMarket.CLOSE;
							res.overUnder15.totalMatched = ParserFootballService.roundNumber(state?.totalMatched || 0, 2);
							break;
						case 'OVER_UNDER_25':
							res.overUnder25 = this.parserOverUnderRates(runners, '2.5');
							res.overUnder25.marketId = marketId || '';
							res.overUnder25.status = state?.status || StatusMarket.CLOSE;
							res.overUnder25.totalMatched = ParserFootballService.roundNumber(state?.totalMatched || 0, 2);
							break;
						case 'BOTH_TEAMS_TO_SCORE':
							res.bothTeamsToScore = this.parserBothTeamsToScoreRates(runners);
							res.bothTeamsToScore.marketId = marketId || '';
							res.bothTeamsToScore.status = state?.status || StatusMarket.CLOSE;
							res.bothTeamsToScore.totalMatched = ParserFootballService.roundNumber(state?.totalMatched || 0, 2);
							break;
						case 'ALT_TOTAL_GOALS':
							res.goalLines = this.parserOtherRatesInArray(runners);
							res.goalLines.marketId = marketId || '';
							res.goalLines.status = state?.status || StatusMarket.CLOSE;
							res.goalLines.totalMatched = ParserFootballService.roundNumber(state?.totalMatched || 0, 2);
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
	public parserMainRates(runners: RunnersMarketNodes[]): IMatchOdds {
		let initRates: ITimeSnapshot = ParserFootballService.initRates(0);
		let res: IMatchOdds = initRates.matchOdds;
		if (runners != null && runners.length) {
			runners.forEach((runner: RunnersMarketNodes, index: number) => {
				let {exchange} = runner;
				// FIXME нужно придумать другую структуру хранения чтоб собирать эти данные
				// res.selectionId = runner.selectionId || 0;
				// res.handicap = ParserFootballService.roundHandicap(runner.handicap);
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
	public parserOverUnderRates(runners: RunnersMarketNodes[], runnerName: string): IOverUnderRates {
		let initRates: ITimeSnapshot = ParserFootballService.initRates(0);
		let res: IOverUnderRates = initRates.overUnder15;
		if (runners != null && runners.length) {
			runners.forEach((runner: RunnersMarketNodes) => {
				let {exchange, description} = runner;
				if (description && description.runnerName === `Under ${runnerName} Goals`) {
					res.selectionId = runner.selectionId || 0;
					res.handicap = ParserFootballService.roundHandicap(runner.handicap);
					res.behind.under = ParserFootballService.behindParser(exchange);
					res.against.under = ParserFootballService.againstParser(exchange);
				} else if (description && description.runnerName === `Over ${runnerName} Goals`) {
					res.selectionId = runner.selectionId || 0;
					res.handicap = ParserFootballService.roundHandicap(runner.handicap);
					res.behind.over = ParserFootballService.behindParser(exchange);
					res.against.over = ParserFootballService.againstParser(exchange);
				}
			});
		}
		return res;
	}

	/**
	 * Метод для определения состояние остальных коэффициентов во время отбора
	 */
	public parserBothTeamsToScoreRates(runners: RunnersMarketNodes[]): IBothTeamsToScore {
		let initRates: ITimeSnapshot = ParserFootballService.initRates(0);
		let res: IBothTeamsToScore = initRates.bothTeamsToScore;
		if (runners != null && runners.length) {
			runners.forEach((runner: RunnersMarketNodes) => {
				let {exchange, description} = runner;
				if (description && description.runnerName === 'Yes') {
					res.selectionId = runner.selectionId || 0;
					res.handicap = ParserFootballService.roundHandicap(runner.handicap);
					res.behind.yes = ParserFootballService.behindParser(exchange);
					res.against.yes = ParserFootballService.againstParser(exchange);
				} else if (description && description.runnerName === 'No') {
					res.selectionId = runner.selectionId || 0;
					res.handicap = ParserFootballService.roundHandicap(runner.handicap);
					res.behind.no = ParserFootballService.behindParser(exchange);
					res.against.no = ParserFootballService.againstParser(exchange);
				}
			});
		}
		return res;
	}

	/**
	 * Метод для определения состояние остальных коэффициентов во время отбора с большим числом вариантов
	 */
	public parserOtherRatesInArray(runners: RunnersMarketNodes[]): IGoalLines {
		let initRates: ITimeSnapshot = ParserFootballService.initRates(0);
		let other: IOtherRate = ParserFootballService.initOtherRate(0);
		let res: IGoalLines = initRates.goalLines;
		if (runners != null && runners.length) {
			runners.forEach((runner: RunnersMarketNodes) => {
				let {exchange, description} = runner;
				if (description && description.runnerName === 'Under') {
					res.selectionId = runner.selectionId || 0;
					other.handicap = ParserFootballService.roundHandicap(runner.handicap);
					other.behind.under = ParserFootballService.behindParser(exchange);
					other.against.under = ParserFootballService.againstParser(exchange);
				} else if (description && description.runnerName === 'Over') {
					res.selectionId = runner.selectionId || 0;
					other.handicap = ParserFootballService.roundHandicap(runner.handicap);
					other.behind.over = ParserFootballService.behindParser(exchange);
					other.against.over = ParserFootballService.againstParser(exchange);
				}
			});
			res.list.push(other);
		}
		return res;
	}
}
