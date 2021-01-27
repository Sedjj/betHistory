import moment, {Moment} from 'moment';

/**
 * Преобразование даты из ISO в формат для вывода
 *
 * @param {String} ISODateString - дата в формате ISO
 * @return {String} пример 19.12.2018
 */
export function dateStringToShortDateString(ISODateString: string): string {
	const tempDate: Moment = ISODateString ? moment(ISODateString) : moment();
	return tempDate.format('DD.MM.YYYY');
}

/**
 * Преобразование даты из ISO в формат для вывода
 *
 * @param {String} ISODateString - дата в формате ISO
 * @return {String} пример 19.12.2018 9:27:03
 */
export function dateStringToFullDateString(ISODateString: string): string {
	const tempDate: Moment = ISODateString ? moment(ISODateString) : moment();
	return tempDate.format('DD.MM.YYYY HH:mm:ss');
}
