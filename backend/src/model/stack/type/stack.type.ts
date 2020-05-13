import {Document} from 'mongoose';

/**
 * Интерфейс для модели mongo
 */
export type IStackModel = IStack & Document;

export type IStack = {
	stackId: number;
	/**
	 * Стек активных событий для получения результата
	 */
	activeEventIds: number[];
};
