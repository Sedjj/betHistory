import {Document} from 'mongoose';
import {Status} from '../../../parser/type/byMarket.type';

/**
 * Интерфейс для модели mongo
 */
export type IFootballModel = IFootball & Document;

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
	selectionId: number;
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
	totalMatched: number;
	handicap: number;
	/**
	 * За
	 */
	behind: {
		p1: number;
		x: number;
		p2: number;
		mod: number;
	};
	/**
	 * Против
	 */
	against: {
		p1: number;
		x: number;
		p2: number;
		mod: number;
	};
};

/**
 * Состояние "больше-меньше" коэффициентов во время отбора
 */
export type IOverUnderRates = {
	selectionId: number;
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
	selectionId: number;
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
	totalMatched: number;
	handicap: number;
	/**
	 * За
	 */
	behind: IYesNo;
	/**
	 * Против
	 */
	against: IYesNo;
};

/**
 * Состояние "Количество голов за матч" коэффициентов во время отбора с большим числом вариантов
 */
export type IGoalLines = {
	selectionId: number;
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
	totalMatched: number;
	list: IOtherRate[];
};

export type IOtherRate = {
	handicap: number;
	/**
	 * За
	 */
	behind: IOverUnder;
	/**
	 * Против
	 */
	against: IOverUnder;
};

export type IYesNo = {
	/**
	 * "Обе забьют да"
	 */
	yes: number;
	/**
	 * "Обе забьют нет"
	 */
	no: number;
};

export type IOverUnder = {
	/**
	 * Больше
	 */
	over: number;
	/**
	 * Меньше
	 */
	under: number;
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
