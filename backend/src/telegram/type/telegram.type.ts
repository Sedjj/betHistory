import { InlineKeyboardButton } from "typegram/markup";

/**
 * Интерфейс меню бота
 */
export interface IMenuBot {
	id: number;
	title: string;
	buttons: InlineKeyboardButton[][];
}
