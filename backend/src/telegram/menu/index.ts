import {IMenuBot} from '../type/telegram.type';

/**
 * Функция для возвращения определенного меню в зависимости от парамметров.
 *
 * @param {String} item какое меню нужно вернуть
 * @param {String} text текст для подстановки где это нужно
 */
export function menuList(item: string, text: string = '0'): IMenuBot {
	switch (item) {
		case 'days':
			return {
				id: 1,
				title: 'Выберите количество дней на экспорт',
				buttons: [
					[
						{text: '-', callback_data: 'down'},
						{text, callback_data: 'value'},
						{
							text: '+',
							callback_data: 'up',
						},
					],
					[{text: 'экспорт', callback_data: 'export'}],
				],
			};
		case 'selectSport':
			return {
				id: 2,
				title: 'Выберете вид спорта',
				buttons: [[{text: 'Футбол', callback_data: 'exportFootball'}]],
			};
		case 'rate':
			return {
				id: 3,
				title: 'Выберете действие',
				buttons: [
					[{text: 'Вкл ставки', callback_data: 'enableBets'}],
					[{text: 'Выкл ставки', callback_data: 'turnOffBets'}],
				],
			};
		case 'getFile':
			return {
				id: 5,
				title: 'Выберите файл для скачивания',
				buttons: [
					[{text: 'debug logs', callback_data: 'debugLogs'}],
					[{text: 'error logs', callback_data: 'errorLogs'}],
				],
			};
		case 'betAmount':
			return {
				id: 6,
				title: 'Выберите сумму ставки',
				buttons: [
					[
						{text: '-1', callback_data: 'downBets'},
						{text, callback_data: 'value'},
						{
							text: '+1',
							callback_data: 'upBets',
						},
					],
				],
			};
		case 'verification':
			return {
				id: 7,
				title: 'Выберите действие',
				buttons: [
					[{text: 'Вкл verification', callback_data: 'enableVerification'}],
					[{text: 'Выкл verification', callback_data: 'turnOffVerification'}],
				],
			};
		default:
			return {
				id: 0,
				title: '',
				buttons: [
					[
						{text: '', callback_data: ''},
						{text, callback_data: ''},
						{
							text: '',
							callback_data: '',
						},
					],
				],
			};
	}
}
