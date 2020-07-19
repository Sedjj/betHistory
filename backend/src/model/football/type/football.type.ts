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
	matchOdds: IMainRates;
	/**
	 * Состояние "Менее 1,5" коэффициентов во время отбора
	 */
	under15: IOtherRates;
	/**
	 * Состояние "Менее 2,5" коэффициентов во время отбора
	 */
	under25: IOtherRates;
	/**
	 * Состояние "Обе забьют да" коэффициентов во время отбора
	 */
	bothTeamsToScoreYes: IOtherRates;
	/**
	 * Состояние "Обе забьют нет" коэффициентов во время отбора
	 */
	bothTeamsToScoreNo: IOtherRates;
	/**
	 * Состояние "Количество голов за матч" коэффициентов во время отбора
	 */
	allTotalGoals: IOtherRatesInArray;
};

/**
 * Состояние основных коэффициентов во время отбора
 */
export type IMainRates = {
	selectionId: number;
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
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
 * Состояние остальных коэффициентов во время отбора
 */
export type IOtherRates = {
	selectionId: number;
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
} & IOtherRate;

/**
 * Состояние остальных коэффициентов во время отбора с большим числов вариантов
 */
export type IOtherRatesInArray = {
	selectionId: number;
	/**
	 * Идентификатор отбора по коэффициентам
	 */
	marketId: string;
	status: Status;
	list: IOtherRate[];
};

/**
 * Состояние остальных коэффициентов
 */
export type IOtherRate = {
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
