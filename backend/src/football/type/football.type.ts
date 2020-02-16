import {Document} from 'mongoose';

/**
 * Интерфейс для модели mongo
 */
export interface IFootballModel extends IFootball, Document {

}

export interface IFootball {
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
	time: number;
	score: IScore;
	command: ICommand;
	rates: ITimeSnapshot;
	cards: ICardsCommands;
	createdBy: string;
	modifiedBy: string;
}

/**
 * Интерфес счета матча и результата
 */
export interface IScore {
	sc1: number;
	sc2: number;
	resulting: string;
}

/**
 * Интерфес общей информации о команндах
 */
export interface ICommand {
	/**
	 * Русское название команд
	 */
	ru: INameCommand;
	/**
	 * Английское название команд
	 */
	en: INameCommand;
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
}

/**
 * Интерфес названия команд и лиги
 */
export interface INameCommand {
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
}

/**
 *  Интерфейс коэффициентов для ставки
 */
export interface ITimeSnapshot {
	/**
	 * Коэфициент на который ставим
	 */
	/*rate: number;*/
	mainRates: IMainRates;
	/**
	 * Состояние "Менее 1,5" коэффициентов во время отбора
	 */
	underOneAndHalf: IMainRates;
	/**
	 * Состояние "Менее 2,5" коэффициентов во время отбора
	 */
	underTwoAndHalf: IOtherRates;
	/**
	 * Состояние "Обе забьют да" коэффициентов во время отбора
	 */
	bothScoreYes: IOtherRates;
	/**
	 * Состояние "Обе забьют нет" коэффициентов во время отбора
	 */
	bothScoreNo: IOtherRates;
	/**
	 * Состояние "Азиатский гандикап" коэффициентов во время отбора
	 */
	asianHandicap: IOtherRates;
}

/**
 * Состояние основных коэффициентов во время отбора
 */
export interface IMainRates {
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
}

/**
 * Состояние остальных коэффициентов во время отбора
 */
export interface IOtherRates {
	behind: {
		p1: number;
		p2: number;
	};
	against: {
		p1: number;
		p2: number;
	};
}

/**
 * Интерфейс общей информаци о картах
 */
export interface ICardsCommands {
	one: ICards;
	two: ICards;
}

/**
 * Интерфейс карты команды
 */
export interface ICards {
	red: number;
	attacks: number;
	danAttacks: number;
	shotsOn: number;
	shotsOff: number;
}

export interface IFootballQuery {
	matchId: string;
	strategy: string;
}