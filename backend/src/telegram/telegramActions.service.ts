import {Injectable} from '@nestjs/common';
import path from 'path';
import {Context, TelegramActionHandler} from 'nest-telegram';
import {authPhone, counterWaiting, exportStatus, rateAmount, rateStatus} from '../store';
import config from 'config';
import {IKeyboardButton, IMenuBot} from './interfaces/telegram.interface';
import {menuList} from './bot/menu';
import {throttle} from '../utils/throttle';
import {readFileToStream} from '../utils/fsHelpers';
import {exportFootballStatistic} from '../export';
import {TelegramService} from './telegram.service';
import {ReadStream} from 'fs';
import {exportBackup} from '../backupBD';

@Injectable()
export class TelegramActions {
	/**
	 * Функция для генерации встроенной клавиатуры.
	 *
	 * @param {Context} ctx контекст ответа
	 * @param {IMenuBot} msg объект подменю
	 */
	private static async inlineKeyboard(ctx: Context, msg: IMenuBot): Promise<void> {
		await ctx.replyWithMarkdown(msg.title, {
			reply_markup: {
				inline_keyboard: msg.buttons,
			},
			parse_mode: 'Markdown'
		});
	}

	/**
	 * Обертка для отправки alert сообщения в бот.
	 *
	 * @param {Context} ctx контекст ответа
	 * @param {String} text названиеы
	 */
	private static async sendAnswerText(ctx: Context, text: string): Promise<void> {
		await ctx.answerCbQuery(text, true);
	}

	/**
	 * Обертка для редактирования inline_keyboard в боте.
	 *
	 * @param {Context} ctx контекст ответа
	 * @param {String} text названиеы
	 * @param {String} count текст для замены
	 * @returns {Promise<void>}
	 */
	private static async editMessageReplyMarkup(ctx: Context, text: string, count: string): Promise<void> {
		await ctx.editMessageReplyMarkup({
			inline_keyboard: menuList(text, count).buttons
		});
	}
	
	private readonly exportFootballStatisticDebounce: any;
	private readonly storagePath: string;
	private readonly logsDirectory: string;
	private readonly token: string;
	private readonly supportChatId: string;

	private readonly buttons: any = {
		waiting: 'Сколько матчей в ожидании',
		selectSport: 'Вид спорта',
		rate: 'Ставки',
		getFile: 'Получить файл',
		backup: 'Бэкап',
		betAmount: 'Сумма ставки',
		verification: 'Проверку входа в систему',
	};

	constructor(
		private readonly telegramService: TelegramService
	) {
		if (process.env.NODE_ENV === 'development') {
			this.token = config.get<string>('bots.supportProd.token');
			this.supportChatId = config.get<string>('bots.supportDev.chatId');
		} else {
			this.token = config.get<string>('bots.supportProd.token');
			this.supportChatId = config.get<string>('bots.supportProd.chatId');
		}

		this.exportFootballStatisticDebounce = throttle(exportFootballStatistic, 20000);
		this.storagePath = config.get<string>('path.storagePath') || process.cwd();
		this.logsDirectory = config.get<string>('path.directory.logs') || 'logs';
	}

	@TelegramActionHandler({onStart: true})
	protected async start(ctx: Context) {
		if (!(ctx.message && ctx.message.text)) {
			return;
		}
		this.sendText(ctx, 'Hi, choose action!');
	}

	private get keyboard(): IKeyboardButton[][] {
		return [
			[this.buttons.waiting],
			[this.buttons.rate],
			[this.buttons.selectSport],
			[this.buttons.getFile],
			[this.buttons.backup],
			[this.buttons.betAmount],
			[this.buttons.verification],
		];
	}

	@TelegramActionHandler({message: /code-(\d{4,6})$/})
	protected async code(ctx: Context) {
		if (ctx.message && ctx.message.text) {
			const code = ctx.message.text.split('-')[1];
			if (code) {
				authPhone.setCode(code);
			}
		}
	}

	@TelegramActionHandler({message: /tel-(\d{8})$/})
	protected async phone(ctx: Context) {
		if (ctx.message && ctx.message.text) {
			const phone = ctx.message.text.split('-')[1];
			if (phone) {
				authPhone.setPhone(phone);
			}
		}
	}

	@TelegramActionHandler({message: 'Сколько матчей в ожидании'})
	protected async waiting(ctx: Context) {
		this.sendText(ctx, `Матчей ожидающих Total: ${counterWaiting.count}`);
	}

	@TelegramActionHandler({message: 'Вид спорта'})
	protected async selectSport(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('selectSport'));
	}

	@TelegramActionHandler({message: 'Ставки'})
	protected async rate(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('rate'));
	}

	@TelegramActionHandler({message: 'Получить файл'})
	protected async getFile(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('getFile'));
	}

	@TelegramActionHandler({message: 'Бэкап'})
	protected async backup(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('backup'));
	}

	@TelegramActionHandler({message: 'Сумма ставки'})
	protected async betAmount(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('betAmount', rateAmount.bets.toString()));
	}

	@TelegramActionHandler({message: 'Проверку входа в систему'})
	protected async verification(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('verification'));
	}

	@TelegramActionHandler({message: 'up'})
	protected async up(ctx: Context) {
		exportStatus.increase(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
	}

	@TelegramActionHandler({message: 'down'})
	protected async down(ctx: Context) {
		if (exportStatus.count > 2) {
			exportStatus.decrease(1);
			await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
		}
	}

	@TelegramActionHandler({message: 'upBets'})
	protected async upBets(ctx: Context) {
		rateAmount.increase(10);
		await TelegramActions.editMessageReplyMarkup(ctx, 'betAmount', rateAmount.bets.toString());
	}

	@TelegramActionHandler({message: 'downBets'})
	protected async downBets(ctx: Context) {
		if (rateAmount.bets > 10) {
			rateAmount.decrease(10);
			await TelegramActions.editMessageReplyMarkup(ctx, 'betAmount', rateAmount.bets.toString());
		}
	}

	@TelegramActionHandler({message: 'export'})
	protected async export(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.exportStatisticDebounce();
		await this.sendText(ctx, 'Hi, choose action!');
		await TelegramActions.inlineKeyboard(ctx, menuList('betAmount', rateAmount.bets.toString()));
	}

	@TelegramActionHandler({message: 'exportFootball'})
	protected async exportFootball(ctx: Context) {
		exportStatus.setName('football');
		await TelegramActions.inlineKeyboard(ctx, menuList('days', exportStatus.count.toString()));
	}

	@TelegramActionHandler({message: 'exportTableTennis'})
	protected async exportTableTennis(ctx: Context) {
		exportStatus.setName('tableTennis');
		await TelegramActions.inlineKeyboard(ctx, menuList('days', exportStatus.count.toString()));
	}

	@TelegramActionHandler({message: 'exportTennis'})
	protected async exportTennis(ctx: Context) {
		exportStatus.setName('tennis');
		await TelegramActions.inlineKeyboard(ctx, menuList('days', exportStatus.count.toString()));
	}

	@TelegramActionHandler({message: 'exportBasketball'})
	protected async exportBasketball(ctx: Context) {
		exportStatus.setName('basketball');
		await TelegramActions.inlineKeyboard(ctx, menuList('days', exportStatus.count.toString()));
	}

	@TelegramActionHandler({message: 'backupFootballs'})
	protected async backupFootballs(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await exportBackup('footballs');
		await this.sendText(ctx, 'Hi, choose action!');
	}

	@TelegramActionHandler({message: 'backupTableTennis'})
	protected async backupTableTennis(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await exportBackup('tabletennis');
		await this.sendText(ctx, 'Hi, choose action!');
	}

	@TelegramActionHandler({message: 'backupTennis'})
	public async backupTennis(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await exportBackup('tennis');
		await this.sendText(ctx, 'Hi, choose action!');
	}

	@TelegramActionHandler({message: 'backupBasketball'})
	protected async backupBasketball(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await exportBackup('basketball');
		await this.sendText(ctx, 'Hi, choose action!');
	}

	@TelegramActionHandler({message: 'enableBets'})
	protected async enableBets(ctx: Context) {
		rateStatus.turnOn();
		await TelegramActions.sendAnswerText(ctx, 'Betting mechanism will be enabled');
	}

	@TelegramActionHandler({message: 'turnOffBets'})
	protected async turnOffBets(ctx: Context) {
		rateStatus.turnOff();
		await TelegramActions.sendAnswerText(ctx, 'Betting mechanism will be stopped');
	}

	@TelegramActionHandler({message: 'debugLogs'})
	protected async debugLogs(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.getLogs();
		await this.sendText(ctx, 'Hi, choose action!');
	}

	@TelegramActionHandler({message: 'enableVerification'})
	protected async enableVerification(ctx: Context) {
		authPhone.turnOn();
		await TelegramActions.sendAnswerText(ctx, 'Enable login verification');
	}

	@TelegramActionHandler({message: 'turnOffVerification'})
	protected async turnOffVerification(ctx: Context) {
		authPhone.turnOff();
		await TelegramActions.sendAnswerText(ctx, 'Stopped login verification');
	}

	/**
	 * Обертка для отправки сообщения в бот.
	 *
	 * @param {Context} ctx контекст ответа
	 * @param {String} text текст для отправки
	 */
	private async sendText(ctx: Context, text: string): Promise<void> {
		await ctx.replyWithMarkdown(text, {
			reply_markup: {
				keyboard: this.keyboard,
			},
			parse_mode: 'Markdown'
		});
	}

	/**
	 * Общий метод для экспорта.
	 */
	private exportStatisticDebounce(): void {
		if (exportStatus.name === 'football') {
			this.exportFootballStatisticDebounce(exportStatus.count);
		}
		exportStatus.clear();
	}

	/**
	 * Метод для получения лог файла.
	 */
	private async getLogs(): Promise<void> {
		try {
			const stream: ReadStream = await readFileToStream(path.join(this.storagePath, this.logsDirectory, 'debug.log'));
			await this.telegramService.setFileApiTelegram(this.token, this.supportChatId, stream);
		} catch (e) {
			console.log('Error getLogs -> ' + e);
		}
	}

	/**
	 * Проверка прав на доступ к меню.
	 *
	 * @param {Object} msg объект что пришел из telegram
	 */
	/*private async accessCheck(msg) {                // ctx.update.message.chat.id
		const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
		if (!this.administrators.some((user) => user === chat)) {
			this.stop();
		}
	}*/
}