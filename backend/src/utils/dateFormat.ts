const dateFormat = {
	day: 'numeric',
	month: 'numeric',
	timezone: 'UTC',
	year: 'numeric'
};

const timeFormat = {
	hour: 'numeric',
	minute: 'numeric'
};

const dateTimeFormat = {
	hour: 'numeric',
	minute: 'numeric',
	day: 'numeric',
	month: 'numeric',
	timezone: 'UTC',
	year: 'numeric'
};

/**
 * Пребразование даты в строку вида yyyy-mm-dd hh:mm
 *
 * @param {Date} date - дата
 * @returns {String} дата в формате строки
 */
export function getFormattedDateTime(date: Date) {
	return new Intl.DateTimeFormat('ru-RU', dateTimeFormat).format(date);
}

/**
 * Пребразование даты в строку вида yyyy-mm-dd
 *
 * @param {Date} date - дата
 * @returns {String} дата в формате строки
 */
export function getFormattedDate(date: Date) {
	return new Intl.DateTimeFormat('ru-RU', dateFormat).format(date);
}

/**
 * Пребразование даты в строку времени вида hh:mm
 *
 * @param {Date} date - дата.
 * @returns {String} дата в формате строки
 */
export function getFormattedTime(date: Date) {
	return new Intl.DateTimeFormat('ru-RU', timeFormat).format(date);
}

/**
 * Пребразование даты в число для сравнения
 *
 * @param {Date} date - дата
 * @returns {String} дата в формате строки
 */
export function getTime(date: Date) {
	return new Date(getFormattedDateTime(date)).getTime();
}

/**
 * Преобразует строку даты в формата вида yyyy-mm-dd hh:mm
 *
 * @param {Date} date - дата
 * @returns {String} дата в формате строки
 */
export function getLocalDateTime(date: Date) {
	return getFormattedDateTime(new Date(date));
}

/**
 * Преобразует строку даты в формата вида yyyy.mm.dd
 *
 * @param {Date} date - дата
 * @return {String} пример 2018.12.19
 */
export function getLocalStringToDate(date: Date) {
	const tempDate = new Date(date);
	return tempDate.toLocaleDateString('en-EN', {timeZone: 'UTC'});
}

/**
 * Преобразует строку даты в формата вида yyyy-mm-dd
 *
 * @param {String} date - дата
 * @returns {String} дата в формате строки
 */
export function getStringToUTCDateString(date: string) {
	return date.split('T')[0];
}