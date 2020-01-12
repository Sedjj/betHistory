import {HttpException, HttpService, HttpStatus, Injectable} from '@nestjs/common';
import {Observable} from 'rxjs';
import {AxiosResponse} from 'axios';
import {ReadStream} from 'fs';

@Injectable()
export class TelegramService {
	private readonly baseUrl: string;

	constructor(
		private readonly httpService: HttpService
	) {
		this.baseUrl = 'https://api.telegram.org/bot';
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
	public setFileApiTelegram(token: string, chatId: string, document: ReadStream): Promise<AxiosResponse<Response>> {
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
	 * @param {File} document данные для отправки
	 * @param {String} title заголовок фотки
	 * @returns {Promise}
	 */
	public setPhotoApiTelegram(token: string, chatId: string, document: File, title: string): Observable<AxiosResponse<Response>> {
		const data = new FormData();
		data.append('chat_id', chatId);
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
	public setTextApiTelegram(token: string, chatId: string, text: string): Observable<AxiosResponse<Response>> {
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

		/*return new Promise((resolve, reject) => {
			request.post(props, (error, res, body) => {
				if (error || (res && res.statusCode !== 200)) {
					log.error(`setTextApiTelegram: code: ${res && res.statusCode}, error: ${res ? res.statusMessage : (error && error.message)}`);
					return reject(error);
				}
				log.debug(`Отработал: Метод для отправки соощения ${JSON.stringify(body.result)}`);
				resolve(body);
			});
		});*/
	}
}