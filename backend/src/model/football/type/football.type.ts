import { Status } from "../../../parser/type/byMarket.type";

export type IFootball = {
	/**
	 * Идентификатор матча с сайта
	 */
	marketId: string;
	/**
	 * Идентификатор события
	 */
	eventId: number;
	/**
	 * Стратегия отбора матча
	 */
	strategy: number;
	/**
	 * время матча в минутах
	 */
	time: number;
	score: IScore;
	command: ICommand;
	rates: ITimeSnapshot;
	cards: ICardsCommands;
	createdBy: string;
	modifiedBy: string;
};

/**
 * Интерфейс счета матча и результата
 */
export type IScore = {
	sc1: number;
	sc2: number;
	resulting: string;
};

/**
 * Интерфейс общей информации о команндах
 */
export type ICommand = {
	/**
	 * Название первой команды
	 */
	one: string;
	/**
	 * Название первой команды
	 */
	two: string;
	/**
	 * Название лиги
	 */
	group: string;
	/**
	 * Женская команда
	 */
	women: number;
	/**
	 * Молодежная команда
	 */
	youth: number;
	/**
	 * Нестандартная команда (ограниченная)
	 */
	limited: number;
};

/**
 *  Интерфейс коэффициентов для ставки
 */
export type ITimeSnapshot = {
	matchOdds: IMatchOdds;
	/**
	 * Состояние "Менее 1,5" коэффициентов во время отбора
	 */
	overUnder15: IOverUnderRates;
	/**
	 * Состояние "Менее 2,5" коэффициентов во время отбора
	 */
	overUnder25: IOverUnderRates;
	/**
	 * Состояние "Обе забьют да" коэффициентов во время отбора
	 */
	bothTeamsToScore: IBothTeamsToScore;
	/**
	 * Состояние "Количество голов за матч" коэффициентов во время отбора
	 */
	goalLines: IGoalLines;
};

/**
 * Состояние основных коэффициентов во время отбора
 */
export type IMatchOdds = {
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
	totalMatched: number;
	p1: IBehindAgainst;
	x: IBehindAgainst;
	p2: IBehindAgainst;
	mod: IBehindAgainst;
};

/**
 * Состояние "больше-меньше" коэффициентов во время отбора
 */
export type IOverUnderRates = {
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
	totalMatched: number;
} & IOtherRate;

/**
 * Состояние "Обе команды забьют" коэффициентов во время отбора
 */
export type IBothTeamsToScore = {
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
	totalMatched: number;
	/**
	 * "Обе забьют да"
	 */
	yes: IBehindAgainst;
	/**
	 * "Обе забьют нет"
	 */
	no: IBehindAgainst;
};

/**
 * Состояние "Количество голов за матч" коэффициентов во время отбора с большим числом вариантов
 */
export type IGoalLines = {
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
	totalMatched: number;
	list: IOtherRate[];
};

export type IOtherRate = {
	/**
	 * Больше
	 */
	over: IBehindAgainst;
	/**
	 * Меньше
	 */
	under: IBehindAgainst;
};

export type IBehindAgainst = {
	selectionId: number;
	handicap: number;
	/**
	 * За
	 */
	behind: number;
	/**
	 * Против
	 */
	against: number;
};

/**
 * Интерфейс общей информаци о картах
 */
export type ICardsCommands = {
	one: ICards;
	two: ICards;
};

/**
 * Интерфейс карты команды
 */
export type ICards = {
	red: number;
	yellow: number;
	corners: number;
	attacks: number;
	danAttacks: number;
	shotsOn: number;
	shotsOff: number;
};

export type IFootballQuery = {
	marketId: string;
	strategy: number;
};
