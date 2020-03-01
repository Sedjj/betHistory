import {Document} from 'mongoose';

/**
 * Интерфейс для модели mongo
 */
export type IFootballModel = IFootball & Document;

export type IFootball = {
	/**
	 * Идентификатор матчка с сайта
	 */
	marketIds: string;
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
 * Интерфес счета матча и результата
 */
export type IScore = {
	sc1: number;
	sc2: number;
	resulting: string;
};

/**
 * Интерфес общей информации о команндах
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
	 * Состояние "Колличество голо за матч" коэффициентов во время отбора
	 */
	allTotalGoals: IOtherRates;
};

/**
 * Состояние основных коэффициентов во время отбора
 */
export type IMainRates = {
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
	behind: number;
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
	marketIds: string;
	strategy: string;
};