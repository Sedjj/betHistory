/*import config from 'config';*/
/*import {
	setFileApiTelegram,
	setTextApiTelegram,
	setSupportMsgApiTelegram
} from '../../fetch/fetch.service';*/
import {ReadStream} from 'fs';

/*const token = process.env.NODE_ENV === 'development'
	? config['bots'].dev.token
	: config['bots'].prod.token;*/
/*const chatId = process.env.NODE_ENV === 'development'
	? config['bots'].dev.chatId
	: config['bots'].prod.chatId;
const channelId = process.env.NODE_ENV === 'development'
	? config['bots'].dev['channelId']
	: config['bots'].prod['channelId'];*/

/*const supportChatId = process.env.NODE_ENV === 'development'
	? config['bots'].supportDev.chatId
	: config['bots'].supportProd.chatId;*/
/*
/!**
 * Метод отправки сообщений в телеграмм бот.
 *
 * @param {String} text строка для отправки в чат
 *!/
export function sendMessageChat(text: string) {
	return new Promise((resolve, reject) => {
		try {
			resolve(setTextApiTelegram(token, chatId, text));
		} catch (error) {
			reject(error);
		}
	});
}

/!**
 * Метод отправки сообщений в телеграмм бот.
 *
 * @param {String} text строка для отправки в чат
 *!/
export function sendMessageChannel(text: string) {
	return new Promise((resolve, reject) => {
		try {
			resolve(setTextApiTelegram(token, channelId, text));
		} catch (error) {
			reject(error);
		}
	});
}

/!**
 * Метод отправки технических сообщений в телеграмм бот.
 *
 * @param {String} text строка для отправки в чат
 *!/
export function sendMessageSupport(text: string) {
	return new Promise((resolve, reject) => {
		try {
			resolve(setSupportMsgApiTelegram(token, supportChatId, text));
		} catch (error) {
			reject(error);
		}
	});
}*/

/**
 * Метод отправки файла в телеграмм бот.
 *
 * @param {String} file для отправки в чат
 */
export function sendFile(file: ReadStream) {
	return new Promise((resolve, reject) => {
		try {
			resolve(/*setFileApiTelegram(token, supportChatId, file)*/);
		} catch (error) {
			reject(error);
		}
	});
}