/*
import {Injectable, OnModuleInit} from '@nestjs/common';
import {throttle} from '../utils/throttle';
import {rateStatus, rateAmount, counterWaiting} from '../store';
/!*import {exportBackup} from '../backupBD';*!/
import {use} from 'node-telegram-bot-api-middleware';
import {readFileToStream} from '../utils/fsHelpers';
/!*import {sendFile} from '../api';*!/
import {menuList} from './menu';
import TelegramBot from 'node-telegram-bot-api';
/!*import {
	exportFootballStatistic,
	exportTableTennisStatistic,
	exportTennisStatistic,
	exportBasketballStatistic
} from '../../export';*!/
import config from 'config';
import path from 'path';

const rate: number = config.get<number>('output.rate') || 2000;

@Injectable()
export class BotService implements OnModuleInit {
	/!*	private exportFootballStatisticDebounce: any;
		private exportTableTennisStatisticDebounce: any;
		private exportTennisStatisticDebounce: any;
		private exportBasketballStatisticDebounce: any;*!/
	private supportToken: string;
	private administrators: string[] = [];
	private bot: any;
	private slide = {
		name: '',
		count: 2
	};

	constructor() {
		/!*this.exportFootballStatisticDebounce = throttle(exportFootballStatistic, 20000);
		this.exportTableTennisStatisticDebounce = throttle(exportTableTennisStatistic, 20000);
		this.exportTennisStatisticDebounce = throttle(exportTennisStatistic, 20000);
		this.exportBasketballStatisticDebounce = throttle(exportBasketballStatistic, 20000);*!/

		this.supportToken = process.env.NODE_ENV === 'development'
			? config.get<string>('bots.supportDev.token')
			: config.get<string>('bots.supportProd.token');
		this.administrators = config.get<string[]>('roles.admin');
	}

	public onModuleInit(): void {
		this.botMessage();
	}

	private botMessage(): void {
		const waiting = 'Сколько матчей в ожидании';
		const selectSport = 'Вид спорта';
		const rate = 'Ставки';
		const getFile = 'Получить файл';
		const backup = 'Бэкап';
		const betAmount = 'Сумма ставки';

		const keyboardInit = [
			[waiting],
			[rate],
			[selectSport],
			[getFile],
			[backup],
			[betAmount],
		];

		const response = use(this.accessCheck);

		process.env.NTBA_FIX_319 = '1';

		const supportDev = {
			chatId: '-376344669',
			name: '@error_dev_sedjj_bot',
			token: '633510677:AAGoFQGr8f_cDP3LVHYvRiN7kr5bo13HDew'
		};

		this.bot = new TelegramBot(supportDev.token, {polling: true});

		this.bot.onText(/\/start/, response(async (msg) => {
			if (!msg.text) {
				return;
			}
			await this.menu(msg);
		}));

		this.bot.on('callback_query', async (msg) => {
			if (!msg.data) {
				return;
			}
			const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
			switch (msg.data) {
				case 'up':
					this.slide.count++;
					await this.editMessageReplyMarkup(msg, 'days', this.slide.count.toString());
					break;
				case 'down':
					if (this.slide.count > 2) {
						this.slide.count--;
						await this.editMessageReplyMarkup(msg, 'days', this.slide.count.toString());
					}
					break;
				case 'upBets':
					rateAmount.increase(10);
					await this.editMessageReplyMarkup(msg, 'betAmount', rateAmount.bets.toString());
					break;
				case 'downBets':
					if (rateAmount.bets > 10) {
						rateAmount.decrease(10);
						await this.editMessageReplyMarkup(msg, 'betAmount', rateAmount.bets.toString());
					}
					break;
				case 'export':
					await this.sendAnswerText(msg, 'Ожидайте файл');
					await exportStatisticDebounce();
					await this.menu(msg);
					break;
				case 'exportFootball':
					this.slide.name = 'football';
					await this.inlineKeyboard(chat, menuList('days', this.slide.count.toString()));
					break;
				case 'exportTableTennis':
					this.slide.name = 'tableTennis';
					await this.inlineKeyboard(chat, menuList('days', this.slide.count.toString()));
					break;
				case 'exportTennis':
					this.slide.name = 'tennis';
					await this.inlineKeyboard(chat, menuList('days', this.slide.count.toString()));
					break;
				case 'exportBasketball':
					this.slide.name = 'football';
					await this.inlineKeyboard(chat, menuList('days', this.slide.count.toString()));
					break;
				case 'backupFootballs':
					await this.sendAnswerText(msg, 'Ожидайте файл');
					await exportBackup('footballs');
					await this.menu(msg);
					break;
				case 'backupTableTennis':
					await this.sendAnswerText(msg, 'Ожидайте файл');
					await exportBackup('tabletennis');
					await this.menu(msg);
					break;
				case 'backupTennis':
					await this.sendAnswerText(msg, 'Ожидайте файл');
					await exportBackup('tennis');
					await this.menu(msg);
					break;
				case 'backupBasketball':
					await this.sendAnswerText(msg, 'Ожидайте файл');
					await exportBackup('football');
					await this.menu(msg);
					break;
				case 'enableBets':
					rateStatus.turnOn();
					await this.sendAnswerText(msg, 'Betting mechanism will be enabled');
					break;
				case 'turnOffBets':
					rateStatus.turnOff();
					await this.sendAnswerText(msg, 'Betting mechanism will be stopped');
					break;
				case 'debugLogs':
					await this.sendAnswerText(msg, 'Ожидайте файл');
					await getLogs();
					await this.menu(msg);
					break;
			}
		});

		this.bot.on('message', response(async (msg) => {
			if (!msg.text) {
				return;
			}
			const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
			this.slide.count = 2;
			this.slide.name = '';
			switch (msg.text.toString()) {
				case waiting:
					await this.sendText(msg, `Матчей ожидающих Total: ${counterWaiting.count}`);
					break;
				case selectSport:
					await this.inlineKeyboard(chat, menuList('selectSport'));
					break;
				case betAmount:
					await this.inlineKeyboard(chat, menuList('betAmount', rateAmount.bets.toString()));
					break;
				case rate:
					await this.inlineKeyboard(chat, menuList('rate'));
					break;
				case backup:
					await this.inlineKeyboard(chat, menuList('backup'));
					break;
				case getFile:
					await this.inlineKeyboard(chat, menuList('getFile'));
					break;
			}
		}));
	}

	private async menu(msg) {
		const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
		await this.bot.sendMessage(chat, 'Hi, choose action!', {
			reply_markup: {
				keyboard: keyboardInit,
				parse_mode: 'Markdown'
			}
		});
	}

	/!**
	 * Функция для генерации встроенной клавиатуры
	 * @param chat
	 * @param msg
	 *!/
	private async inlineKeyboard(chat, msg) {
		const options = {
			reply_markup: JSON.stringify({
				inline_keyboard: msg.buttons,
				parse_mode: 'Markdown'
			})
		};
		await this.bot.sendMessage(chat, msg.title, options);
		/!*bot.sendMessage(chat, ' ', {
			reply_markup: {
				remove_keyboard: true
			}
		});*!/
	}

	/!**
	 * Проверка прав на доступ к меню.
	 *
	 * @param {Object} msg объект что пришел из telegram
	 *!/
	private async accessCheck(msg) {
		const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
		if (!this.administrators.some((user) => user === chat)) {
			this.stop();
		}
	}

	/!**
	 * Обертка для отправки сообщения в бот.
	 *
	 * @param {Object} msg объект что пришел из telegram
	 * @param {String} text текст для отправки
	 *!/
	private async sendText(msg, text) {
		await this.bot.sendMessage(
			msg.chat.id,
			text,
			{
				reply_markup: {
					keyboard: keyboardInit
				}
			}
		);
	}

	/!**
	 * Обертка для удаления сообщения
	 * @param {Object} msg объект что пришел из telegram
	 *!/
	private async deleteMessage(msg) {
		await this.bot.sendMessage(
			msg.chat.id,
			msg.message_id,
			{
				reply_markup: {
					remove_keyboard: true
				}
			}
		);
	}

	/!**
	 * Обертка для редактирования сообщения в боте.
	 *
	 * @param {Object} msg объект что пришел из telegram
	 * @param {String} text текст для замены
	 *!/
	private async editMessage(msg, text) {
		const chatId = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
		const opts = {
			chat_id: chatId,
			message_id: msg.message.message_id
		};
		await this.bot.editMessageText(text, opts);
	}

	/!**
	 * Обертка для редактирования inline_keyboard в боте.
	 *
	 * @param {Object} msg объект что пришел из telegram
	 * @param {String} text названиеы
	 * @param {String} count текст для замены
	 * @returns {Promise<void>}
	 *!/
	private async editMessageReplyMarkup(msg, text, count) {
		const chatId = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
		const opts = {
			chat_id: chatId,
			message_id: msg.message.message_id
		};
		await this.bot.this.editMessageReplyMarkup({
			inline_keyboard: menuList(text, count).buttons
		}, opts);
	}

	/!**
	 * Обертка для отправки alert сообщения в бот.
	 *
	 * @param {Object} msg объект что пришел из telegram
	 * @param {String} text текст для отправки
	 *!/
	private async sendAnswerText(msg, text) {
		await this.bot.answerCallbackQuery(
			msg.id,
			text,
			true
		);
	}

	/!**
	 * Обертка для отправки сообщений об ошибке.
	 *
	 * @param {String} text текст для отправки
	 *!/
	private async sendError(text) {
		await this.bot.sendMessage(
			config.myId,
			text
		);
	}

	/!**
	 * Общий метод для экспорта.
	 *!/
	private exportStatisticDebounce() {
		switch (this.slide.name) {
			case 'football':
				exportFootballStatisticDebounce(this.slide.count);
				break;
			case 'tableTennis':
				exportTableTennisStatisticDebounce(this.slide.count);
				break;
			case 'tennis':
				exportTennisStatisticDebounce(this.slide.count);
				break;
			case 'football':
				exportBasketballStatisticDebounce(this.slide.count);
				break;
		}
		this.slide.count = 2;
		this.slide.name = '';
	}

	/!**
	 * Метод для получения лог файла.
	 *
	 * @returns {Promise<void>}
	 *!/
	private async getLogs() {
		try {
			const stream = await readFileToStream(path.join(storagePath, logsDirectory, 'debug.log'));
			await sendFile(stream);
		} catch (e) {
			console.log('Error getLogs -> ' + e);
		}
	}
}
*/
