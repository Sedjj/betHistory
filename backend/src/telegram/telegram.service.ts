import {Injectable} from '@nestjs/common';
import config from 'config';
import {InjectBot} from 'nestjs-telegraf';
import {MyLogger} from '../logger/myLogger.service';
import {Context, Telegraf} from 'telegraf';

@Injectable()
export class TelegramService {
	private readonly chatId: string;
	private readonly channelId: string;
	private readonly supportChatId: string;

	constructor(@InjectBot() private telegrafService: Telegraf<Context>, private readonly log: MyLogger) {
		if (process.env.NODE_ENV === 'development') {
			this.channelId = config.get<string>('bots.dev.channelId');
			this.chatId = config.get<string>('bots.dev.chatId');
			this.supportChatId = config.get<string>('bots.dev.supportChatId');
		} else {
			this.channelId = config.get<string>('bots.prod.channelId');
			this.chatId = config.get<string>('bots.prod.chatId');
			this.supportChatId = config.get<string>('bots.prod.supportChatId');
		}
	}

	/**
	 * Метод отправки сообщений в чат из телеграмм бота.
	 *
	 * @param {String} text строка для отправки в чат
	 * @param {String} newChatId кастомный канал для вывода
	 */
	public async sendMessageChat(text: string, newChatId = null): Promise<void> {
		try {
			await this.telegrafService.telegram.sendMessage(newChatId || this.chatId, text, {
				parse_mode: 'HTML',
			});
		} catch (e) {
			this.log.error(TelegramService.name, `Error sendMessageChat -> ${e}`);
		}
	}

	/**
	 * Метод отправки сообщений в канал из телеграмм бота.
	 *
	 * @param {String} text строка для отправки в чат
	 * @param {String} newChannelId кастомный канал для вывода
	 */
	public async sendMessageChannel(text: string, newChannelId = null): Promise<void> {
		try {
			await this.telegrafService.telegram.sendMessage(newChannelId || this.channelId, text, {
				parse_mode: 'HTML',
			});
		} catch (e) {
			this.log.error(TelegramService.name, `Error sendMessageChannel -> ${e}`);
		}
	}

	/**
	 * Метод отправки сообщений в чат support из телеграмм бота.
	 *
	 * @param {String} text строка для отправки в чат
	 * @param {String} newSupportChatId кастомный канал для вывода
	 */
	public async sendMessageSupport(text: string, newSupportChatId = null): Promise<void> {
		try {
			await this.telegrafService.telegram.sendMessage(newSupportChatId || this.supportChatId, text, {
				parse_mode: 'HTML',
			});
		} catch (e) {
			this.log.error(TelegramService.name, `Error sendMessageSupport -> ${e}`);
		}
	}

	/**
	 * Метод отправки файла через строковый параметр в чат support из телеграмм бота.
	 *
	 * @param {ReadStream} file для отправки в чат
	 * @param {String} title Заголовок для фотки
	 */
	public async sendFile(file: string, title: string = ''): Promise<void> {
		try {
			await this.telegrafService.telegram.sendDocument(
				this.supportChatId,
				{
					source: file,
				},
				{
					caption: title,
					parse_mode: 'HTML',
				},
			);
		} catch (e) {
			this.log.error(TelegramService.name, `Error sendFile -> ${e}`);
		}
	}

	/**
	 * Метод отправки файла через Buffer параметр в чат support из телеграмм бота.
	 *
	 * @param {ReadStream} file для отправки в чат
	 * @param {String} filename имя файла с расширением
	 * @param {String} title Заголовок для фотки
	 */
	public async sendFileOfBuffer(file: Buffer, filename?: string, title: string = ''): Promise<void> {
		try {
			await this.telegrafService.telegram.sendDocument(
				this.supportChatId,
				{
					source: file,
					filename: filename ? filename : undefined,
				},
				{
					caption: title,
					parse_mode: 'HTML',
				},
			);
		} catch (e) {
			this.log.error(TelegramService.name, `Error sendFileOfBuffer -> ${e}`);
		}
	}

	/**
	 * Метод отправки фотки в чат support из телеграмм бота.
	 *
	 * @param {Buffer} file для отправки в чат
	 * @param {String} title Заголовок для фотки
	 */
	public async sendFilePhoto(file: Buffer, title: string): Promise<void> {
		try {
			await this.telegrafService.telegram.sendPhoto(
				this.supportChatId,
				{
					source: file,
				},
				{
					caption: title,
					parse_mode: 'HTML',
				},
			);
		} catch (e) {
			this.log.error(TelegramService.name, `Error sendFilePhoto -> ${e}`);
		}
	}
}
