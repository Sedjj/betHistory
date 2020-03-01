import {HttpException, HttpService, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {Observable} from 'rxjs';
import {AxiosResponse} from 'axios';
import {ReadStream} from 'fs';
import config from 'config';

@Injectable()
export class TelegramService {
	private readonly logger = new Logger(TelegramService.name);
	private readonly baseUrl: string;
	private readonly token: string;
	private readonly chatId: string;
	private readonly channelId: string;
	private readonly supportChatId: string;

	constructor(
		private readonly httpService: HttpService,
	) {
		this.baseUrl = 'https://api.telegram.org/bot';
		if (process.env.NODE_ENV === 'development') {
			this.token = config.get<string>('bots.prod.token');
			this.chatId = config.get<string>('bots.dev.chatId');
			this.channelId = config.get<string>('bots.dev.channelId');
			this.supportChatId = config.get<string>('bots.dev.supportChatId');
		} else {
			this.token = config.get<string>('bots.prod.token');
			this.chatId = config.get<string>('bots.prod.chatId');
			this.channelId = config.get<string>('bots.prod.channelId');
			this.supportChatId = config.get<string>('bots.prod.supportChatId');
		}
	}

	/**
	 * Метод отправки сообщений в телеграмм бот.
	 *
	 * @param {String} text строка для отправки в чат
	 * @param {String} newToken уникальный бот
	 * @param {String} newChatId кастомный канал для вывода
	 */
	public async sendMessageChat(text: string, newToken = null, newChatId = null): Promise<void> {
		try {
			await this.setTextApiTelegram(newToken || this.token, newChatId || this.chatId, text);
		} catch (e) {
			this.logger.error('Error sendMessageChat -> ' + e);
		}
	}

	/**
	 * Метод отправки сообщений в телеграмм бот.
	 *
	 * @param {String} text строка для отправки в чат
	 * @param {String} newToken уникальный бот
	 * @param {String} newChannelId кастомный канал для вывода
	 */
	public async sendMessageChannel(text: string, newToken = null, newChannelId = null): Promise<void> {
		try {
			await this.setTextApiTelegram(newToken || this.token, newChannelId || this.channelId, text);
		} catch (e) {
			this.logger.error('Error sendMessageChannel -> ' + e);
		}
	}

	/**
	 * Метод отправки технических сообщений в телеграмм бот.
	 *
	 * @param {String} text строка для отправки в чат
	 * @param {String} newToken уникальный бот
	 * @param {String} newSupportChatId кастомный канал для вывода
	 */
	public async sendMessageSupport(text: string, newToken = null, newSupportChatId = null): Promise<void> {
		try {
			await this.setTextApiTelegram(newToken || this.token, newSupportChatId || this.supportChatId, text);
		} catch (e) {
			this.logger.error('Error sendMessageSupport -> ' + e);
		}
	}

	/**
	 * Метод отправки файла в телеграмм бот.
	 *
	 * @param {ReadStream} file для отправки в чат
	 */
	public async sendFile(file: ReadStream): Promise<void> {
		try {
			await this.setFileApiTelegram(this.token, this.supportChatId, file);
		} catch (e) {
			this.logger.error('Error sendFile -> ' + e);
		}
	}

	/**
	 * Метод отправки фотки в телеграмм бот.
	 *
	 * @param {ReadStream} file для отправки в чат
	 * @param {String} title Заголовок для фотки
	 */
	public async sendPhoto(file: ReadStream, title: string): Promise<void> {
		try {
			await this.setPhotoApiTelegram(this.token, this.supportChatId, file, title);
		} catch (e) {
			this.logger.error('Error sendPhoto -> ' + e);
		}
	}

	/**
	 * Отправляет файл на API Telegram
	 * https://api.telegram.org/bot741639693:AAHcc9e7pIYSWlAti95Idwejn0iZcwSUqmg/getupdates
	 *
	 * @param {String} token идентификатор бота
	 * @param {String} chatId id чата
	 * @param {ReadStream} document данные для отправки
	 * @returns {Promise}
	 */
	private setFileApiTelegram(token: string, chatId: string, document: ReadStream): Promise<AxiosResponse<Response>> {
		const data = new FormData();
		data.append('chat_id', chatId);
		// @ts-ignore
		data.append('document', document);
		return this.httpService
			.post(
				`${this.baseUrl}${token}/sendDocument`,
				data, {
					headers: {
						'content-type': 'multipart/form-data'
					},
				}
			)
			.toPromise()
			.catch(error => {
					if (error.response) {
						throw new HttpException(
							HttpStatus[error.response.status],
							error.response.status,
						);
					} else {
						const httpCode = 503;
						throw new HttpException(HttpStatus[httpCode], httpCode);
					}
				}
			);
	}

	/**
	 * Отправляет фото на API Telegram
	 * https://api.telegram.org/bot741639693:AAHcc9e7pIYSWlAti95Idwejn0iZcwSUqmg/getupdates
	 *
	 * @param {String} token идентификатор бота
	 * @param {String} chatId id чата
	 * @param {ReadStream} document данные для отправки
	 * @param {String} title заголовок фотки
	 * @returns {Promise}
	 */
	private setPhotoApiTelegram(token: string, chatId: string, document: ReadStream, title: string): Observable<AxiosResponse<Response>> {
		const data = new FormData();
		data.append('chat_id', chatId);
		// @ts-ignore
		data.append('photo', document);
		data.append('caption', title);
		return this.httpService.post(
			`${this.baseUrl}${token}/sendPhoto`,
			data, {
				headers: {
					'content-type': 'multipart/form-data'
				},
			}
		);
	}

	/**
	 * Отправляет сообщение в чат или канал на API Telegram.
	 *
	 * @param {String} token идентификатор бота
	 * @param {String} chatId id чата
	 * @param {String} text текст сообщения
	 * @returns {Promise<any>}
	 */
	private setTextApiTelegram(token: string, chatId: string, text: string): Observable<AxiosResponse<Response>> {
		return this.httpService.post(
			`${this.baseUrl}${token}/sendMessage`,
			{
				chat_id: chatId,
				text,
				parse_mode: 'HTML'
			},
			{
				headers: {
					'content-type': 'application/json'
				},
			}
		);
	}
}