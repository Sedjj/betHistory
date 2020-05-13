import {IFootball} from '../model/football/type/football.type';

/**
 * Метод для округления дробного число
 * @param {Number} value число для округления
 * @param {Number} rlength число до которого округляем
 * @returns {number}
 */
function round(value: number, rlength = 2): number {
	let temp = value;
	if (typeof value === 'number') {
		temp = Number((value).toFixed(rlength));
	}
	return temp;
}

/**
 * Форматирование строки вывода уведомления о вводе телефона.
 *
 * @param {String} nameBot имя бота
 * @returns {*}
 */
export function decorateMessageWaitingPhone(nameBot: string): string {
	return `Перейдите в бота: <code>${nameBot}</code>
	- Введите номер телефона по шаблону 
			+7(********)12 
			<code>tel-********</code> 
	- Нажмите отправить
	- Время на ввод телефона 2 минуты`;
}

/**
 * Форматирование строки вывода уведомления о вводе кода.
 *
 * @param {String} nameBot имя бота
 * @returns {*}
 */
export function decorateMessageWaitingCode(nameBot: string): string {
	return `Перейдите в бота: <code>${nameBot}</code>
	- Введите код подтверждения
			<code>code-*****</code> 
	- Нажмите отправить
	- Время на ввод кода 2 минуты`;
}

/**
 * Форматирование строки вывода ошибки аутентификации по телефону.
 *
 * @returns {*}
 */
export function decorateMessageVerification(): string {
	return 'Аутентификация по телефону прошла с ошибкой, ставки остановлены. Для повтроной попытки включите ставки в боте';
}

/**
 * Форматирование строки вывода для тениса.
 *
 * @param {IFootball} param объект матча
 * @returns {String}
 */
export function decorateMessageTennis(param: IFootball): string {
	const {
		marketId,
		command: {one, two, group},
	} = param;
	return `<code>${marketId}</code>\n${group}\n\n<b>${one}\n${two}</b>`;
}

/**
 * Форматирование строки для канала.
 *
 * @param {IFootball} param объект матча
 * @returns {string}
 */
export function decorateMessageChannel(param: IFootball): string {
	const {
		marketId,
		eventId,
		command: {one, two, group},
		rates: {matchOdds: {behind: {p1, x, p2}}},
		score: {sc1, sc2},
		time
	} = param;
	const scope = `${sc1}:${sc2}`;
	const index = `${p1} / ${x} / ${p2}`;
	const difference = `${round(x - p1)} / ${round(x - p2)} / ${round(p2 - p1)}`;
	let mobile = `<a href="https://www.betfair.com/exchange/football/event/${eventId}/multi-market?marketIds${marketId}">mobile</a>`;
	let pc = `<a href="https://www.betfair.com/exchange/plus/football/market/${marketId}">pc</a>`;
	return `${mobile} / ${pc}\n${group}\n\n<b>${one}\n${two}</b>\n\n<pre>${scope} / ${time}'\n${index}\n${difference}</pre>`;
}