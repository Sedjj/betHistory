import {Injectable} from '@nestjs/common';
import path from 'path';
import {
	Context,
	InjectBot,
	TelegrafAction,
	TelegrafHears,
	TelegrafProvider,
	TelegrafStart,
	TelegrafUse,
} from 'nestjs-telegraf';
import {betAmount, exportStatus, rateStatus} from '../store';
import config from 'config';
import {IKeyboardButton, IMenuBot} from './type/telegram.type';
import {menuList} from './menu';
import {TelegramService} from './telegram.service';
import {ExportService} from '../export/export.service';
import {StackDBService} from '../model/stack/stackDB.service';
import {IStack, StackType} from '../model/stack/type/stack.type';
import {FetchService} from '../fetch/fetch.service';
import {MyLogger} from '../logger/myLogger.service';

@Injectable()
export class TelegramActions {
	private readonly storagePath: string;
	private readonly logsDirectory: string;

	private readonly buttons: any = {
		waiting: 'Сколько матчей в ожидании',
		selectSport: 'Вид спорта',
		rate: 'Ставки',
		getFile: 'Получить файл',
		betAmount: 'Сумма ставки',
	};

	constructor(
		@InjectBot() private bot: TelegrafProvider,
		private readonly telegramService: TelegramService,
		private readonly exportService: ExportService,
		private readonly stackDBService: StackDBService,
		private readonly fetchService: FetchService,
		private readonly log: MyLogger,
	) {
		this.storagePath = config.get<string>('path.storagePath') || process.cwd();
		this.logsDirectory = config.get<string>('path.directory.logs') || 'logs';
	}

	private get keyboard(): IKeyboardButton[][] {
		return [
			[this.buttons.waiting],
			[this.buttons.rate],
			[this.buttons.selectSport],
			[this.buttons.getFile],
			[this.buttons.betAmount],
		];
	}

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
			parse_mode: 'Markdown',
		});
	}

	/**
	 * Обертка для отправки alert сообщения в бот.
	 *
	 * @param {Context} ctx контекст ответа
	 * @param {String} text название
	 */
	private static async sendAnswerText(ctx: Context, text: string): Promise<void> {
		await ctx.answerCbQuery(text, true);
	}

	/**
	 * Обертка для редактирования inline_keyboard в боте.
	 *
	 * @param {Context} ctx контекст ответа
	 * @param {String} text название
	 * @param {String} count текст для замены
	 * @returns {Promise<void>}
	 */
	private static async editMessageReplyMarkup(ctx: Context, text: string, count: string): Promise<void> {
		await ctx.editMessageReplyMarkup({
			inline_keyboard: menuList(text, count).buttons,
		});
	}

	@TelegrafStart()
	protected async start(ctx: Context) {
		if (!(ctx.message && ctx.message.text)) {
			return;
		}
		try {
			const me = await this.bot.telegram.getMe();
			this.log.log(TelegramActions.name, JSON.stringify(me));
			await this.sendText(ctx, 'Hi, choose action!');
		} catch (error) {
			this.log.error(TelegramActions.name, `Error start -> ${error}`);
		}
	}

	/**
	 * Проверка прав на доступ к меню.
	 *
	 * @param {Context} ctx объект что пришел из telegram
	 * @param {Object} next объект что пришел из telegram
	 */
	@TelegrafUse()
	protected async accessCheck(ctx: Context, next?: () => any) {
		let administrators: number[] = config.get<number[]>('roles.admin');
		const chat = ctx.chat != null ? ctx.chat.id : ctx.from != null ? ctx.from.id : 0;
		if (administrators.some(user => user === chat) && next) {
			next();
		}
	}

	@TelegrafHears('Сколько матчей в ожидании')
	protected async waiting(ctx: Context) {
		await this.sendText(ctx, `Матчей ожидающих Total: ${await this.getActiveEvent()}`);
	}

	@TelegrafHears('Вид спорта')
	protected async selectSport(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('selectSport'));
	}

	@TelegrafHears('Ставки')
	protected async rate(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('rate'));
	}

	@TelegrafHears('Получить файл')
	protected async getFile(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('getFile'));
	}

	@TelegrafHears('Сумма ставки')
	protected async betAmount(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('betAmount', betAmount.bets.toString()));
	}

	@TelegrafAction('up')
	protected async up(ctx: Context) {
		exportStatus.increase(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
	}

	@TelegrafAction('down')
	protected async down(ctx: Context) {
		if (exportStatus.count > 0) {
			exportStatus.decrease(1);
			await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
		}
	}

	@TelegrafAction('day_up')
	protected async upDay(ctx: Context) {
		exportStatus.increaseDay(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'selectSport', exportStatus.day.toString());
	}

	@TelegrafAction('day_down')
	protected async downDay(ctx: Context) {
		if (exportStatus.day > 0) {
			exportStatus.decreaseDay(1);
			await TelegramActions.editMessageReplyMarkup(ctx, 'selectSport', exportStatus.day.toString());
		}
	}

	@TelegrafAction('bets_up')
	protected async betsUp(ctx: Context) {
		betAmount.increase(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'betAmount', betAmount.bets.toString());
	}

	@TelegrafAction('bets_down')
	protected async betsDown(ctx: Context) {
		if (betAmount.bets > 7) {
			betAmount.decrease(1);
			await TelegramActions.editMessageReplyMarkup(ctx, 'betAmount', betAmount.bets.toString());
		}
	}

	@TelegrafAction('export')
	protected async export(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.exportStatisticDebounce();
	}

	@TelegrafAction('exportFootball')
	protected async exportFootball(ctx: Context) {
		exportStatus.setName('football');
		await TelegramActions.inlineKeyboard(ctx, menuList('days', exportStatus.count.toString()));
	}

	@TelegrafAction('enableBets')
	protected async enableBets(ctx: Context) {
		rateStatus.turnOn();
		await TelegramActions.sendAnswerText(ctx, 'Betting mechanism will be enabled');
		await this.telegramService.sendMessageSupport('Вкл ставки');
	}

	@TelegrafAction('turnOffBets')
	protected async turnOffBets(ctx: Context) {
		rateStatus.turnOff();
		await TelegramActions.sendAnswerText(ctx, 'Betting mechanism will be stopped');
		await this.telegramService.sendMessageSupport('Выкл ставки');
	}

	@TelegrafAction('debugBetLogs')
	protected async debugBetLogs(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.getLogs('debug');
	}

	@TelegrafAction('debugSeleniumLogs')
	protected async debugSeleniumLogs(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.getLogsOtherServer();
	}

	@TelegrafAction('errorBetLogs')
	protected async errorBetLogs(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.getLogs('error');
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
			parse_mode: 'Markdown',
		});
	}

	/**
	 * Общий метод для экспорта.
	 */
	private async exportStatisticDebounce(): Promise<void> {
		try {
			if (exportStatus.name === 'football') {
				const file = await this.exportService.exportFootballStatisticStream(exportStatus.count, exportStatus.day);
				await this.telegramService.sendFileOfBuffer(file.buffer, file.filename);
			}
		} catch (error) {
			this.log.error(TelegramActions.name, `Error exportStatisticDebounce: ${error}`);
		}
		exportStatus.clear();
	}

	/**
	 * Метод для получения лог файла.
	 */
	private async getLogsOtherServer(): Promise<void> {
		try {
			const file = await this.fetchService.getLogOtherServer();
			await this.telegramService.sendFileOfBuffer(file, 'debug_selenium.log');
		} catch (error) {
			this.log.error(TelegramActions.name, `Error getLogs -> ${error}`);
		}
	}

	/**
	 * Метод для получения лог файла.
	 */
	private async getLogs(name: string): Promise<void> {
		try {
			await this.telegramService.sendFile(path.join(this.storagePath, this.logsDirectory, `${name}.log`));
		} catch (error) {
			this.log.error(TelegramActions.name, `Error getLogs -> ${error}`);
		}
	}

	private async getActiveEvent(): Promise<number> {
		let activeEventIds: number = 0;
		try {
			let stackUsually: IStack = await this.stackDBService.getDataByParam(StackType.UNUSUAL);
			let stackOften: IStack = await this.stackDBService.getDataByParam(StackType.OFTEN);
			activeEventIds = stackUsually.activeEventIds.length + stackOften.activeEventIds.length;
		} catch (error) {
			this.log.error(TelegramActions.name, `Error get active event ids`);
		}
		return activeEventIds;
	}
}
