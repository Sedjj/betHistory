import {Document} from 'mongoose';

/**
 * Интерфейс для модели mongo
 */
export type IStackModel = IStack & Document;

/**
 * Показывает как часто будет обращение к стеку
 */
export enum StackType {
	OFTEN = 'often',
	UNUSUAL = 'unusual',
}

export type IStack = {
	stackId: StackType;
	/**
	 * Стек активных событий для получения результата
	 */
	activeEventIds: number[];
};
