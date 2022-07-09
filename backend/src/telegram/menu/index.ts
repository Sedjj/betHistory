import {IMenuBot} from '../type/telegram.type';

type Props = {
	item: string;
	betAmount?: string;
	shiftInDays?: string;
	amountOfDays?: string;
};

export function menuList({item, betAmount, shiftInDays, amountOfDays}: Props): IMenuBot {
	switch (item) {
		case 'selectSport':
			return {
				id: 1,
				title: 'Выберете вид спорта и начало экспорта',
				buttons: [
					[{text: 'Начало экспорта(сдвиг в днях)', callback_data: '2'}],
					[
						{text: '-', callback_data: 'day_down'},
						{text: shiftInDays ?? '0', callback_data: 'value'},
						{text: '+', callback_data: 'day_up'},
					],
					[{text: 'Количество дней на экспорт', callback_data: '2'}],
					[
						{text: '-', callback_data: 'down'},
						{text: amountOfDays ?? '0', callback_data: 'value'},
						{text: '+', callback_data: 'up'},
					],
					[{text: 'экспорт', callback_data: 'export'}],
				],
			};
		case 'getFile':
			return {
				id: 2,
				title: 'Выберите файл для скачивания',
				buttons: [
					[
						{text: 'bethistory', callback_data: 'debugBetLogs'},
						{text: 'selenium', callback_data: 'debugSeleniumLogs'},
					],
					[{text: 'bethistory error', callback_data: 'errorBetLogs'}],
				],
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
		case 'betAmount':
			return {
				id: 4,
				title: 'Выберите сумму ставки',
				buttons: [
					[
						{text: '-1', callback_data: 'bets_down'},
						{text: betAmount ?? '0', callback_data: 'value'},
						{text: '+1', callback_data: 'bets_up'},
					],
				],
			};
		case 'systemFunctions':
			return {
				id: 5,
				title: 'System functions',
				buttons: [[{text: 'Очистка БД', callback_data: 'confirmStartCleaningBD'}]],
			};
		case 'clearBD':
			return {
				id: 6,
				title: 'Confirm start cleaning BD',
				buttons: [[{text: 'Вы уверены?(да)', callback_data: 'startClearBD'}]],
			};
		default:
			return {
				id: 0,
				title: '',
				buttons: [
					[
						{text: '', callback_data: ''},
						{text: '0', callback_data: ''},
						{text: '', callback_data: ''},
					],
				],
			};
	}
}
