export interface IConf {
	/**
	 * Размер ставки
	 */
	betAmount: number;
	/**
	 * Временные интервалы для парсинга
	 */
	time: ITime[];
	/**
	 * Прибавляем к сумме результата матчей
	 */
	typeRate: number[];
	/**
	 * Math.abs(p1 - p2) < rate
	 */
	rate: number[];
}

/**
 * Временные интервалы для парсинга
 */
export interface ITime {
	before: number;
	after: number;
}