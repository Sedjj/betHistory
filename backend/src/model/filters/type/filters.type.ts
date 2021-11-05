import {Document} from 'mongoose';

/**
 * Интерфейс для модели mongo
 */
export type IFiltersModel = IFilters & Document;

export type IFilters = {
	confId: number;
	/**
	 * Группы для исключения
	 */
	groups: IExcludeGroupRate[];
	createdBy?: string;
	modifiedBy?: string;
};

/**
 * Группы для исключения
 */
export type IExcludeGroupRate = {
	name: string;
	enable: number;
};
