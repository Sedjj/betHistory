import {Document} from 'mongoose';

/**
 * Интерфейс для модели mongo
 */
export type IConfModel = IConf & Document;

export type IConf = {
	confId: number;
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
	rate: IRateStrategy[];
	createdBy?: string;
	modifiedBy?: string;
};

/**
 * Временные интервалы для парсинга
 */
export type ITime = {
	before: number;
	after: number;
};

/**
 * Math.abs(p1 - p2) < rate
 */
export type IRateStrategy = {
	title: string;
	rate: number;
};