import {IKeyboardButton} from '../interfaces/telegram.interface';

export class BotOptionsFactory {
	private buttons: any;

	constructor() {
		this.buttons = {
			waiting: 'Сколько матчей в ожидании',
			selectSport: 'Вид спорта',
			rate: 'Ставки',
			getFile: 'Получить файл',
			backup: 'Бэкап',
			betAmount: 'Сумма ставки',
		};
	}

	get keyboard(): IKeyboardButton[][] {
		return [
			[this.buttons.waiting],
			[this.buttons.rate],
			[this.buttons.selectSport],
			[this.buttons.getFile],
			[this.buttons.backup],
			[this.buttons.betAmount],
		];
	}
}