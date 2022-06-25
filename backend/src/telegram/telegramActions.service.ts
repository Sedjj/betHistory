import path from 'path';
import {Action, Ctx, Hears, InjectBot, Start, Update, Use} from 'nestjs-telegraf';
import {betAmount, exportStatus, rateStatus} from '../store';
import config from 'config';
import {IKeyboardButton, IMenuBot} from './type/telegram.type';
import {menuList} from './menu';
import {TelegramService} from './telegram.service';
import {ExportService} from '../export/export.service';
import {StackDBService} from '../model/stack/stackDB.service';
import {StackType} from '../model/stack/type/stack.type';
import {FetchService} from '../fetch/fetch.service';
import {MyLogger} from '../logger/myLogger.service';
import {Context, Telegraf} from 'telegraf';
import {Stack} from '../model/stack/schemas/stack.schema';

@Update()
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
		@InjectBot() private bot: Telegraf<Context>,
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
		await ctx.answerCbQuery(text, {show_alert: true});
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

	@Start()
	protected async start(@Ctx() ctx: Context) {
		console.log('ctx.message', ctx.message);
		if (!(ctx.message && ctx.message)) {
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
	@Use()
	protected async accessCheck(@Ctx() ctx: Context, next?: () => any) {
		let administrators: number[] = config.get<number[]>('roles.admin');
		const chat = ctx.chat != null ? ctx.chat.id : ctx.from != null ? ctx.from.id : 0;
		if (administrators.some(user => user === chat) && next) {
			next();
		}
	}

	@Hears('Сколько матчей в ожидании')
	protected async waiting(@Ctx() ctx: Context) {
		await this.sendText(ctx, `Матчей ожидающих Total: ${await this.getActiveEvent()}`);
	}

	@Hears('Вид спорта')
	protected async selectSport(@Ctx() ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('selectSport'));
	}

	@Hears('Ставки')
	protected async rate(@Ctx() ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('rate'));
	}

	@Hears('Получить файл')
	protected async getFile(@Ctx() ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('getFile'));
	}

	@Hears('Сумма ставки')
	protected async betAmount(@Ctx() ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('betAmount', betAmount.bets.toString()));
	}

	@Action('up')
	protected async up(@Ctx() ctx: Context) {
		exportStatus.increase(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
	}

	@Action('down')
	protected async down(@Ctx() ctx: Context) {
		if (exportStatus.count > 0) {
			exportStatus.decrease(1);
			await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
		}
	}

	@Action('day_up')
	protected async upDay(@Ctx() ctx: Context) {
		exportStatus.increaseDay(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'selectSport', exportStatus.day.toString());
	}

	@Action('day_down')
	protected async downDay(@Ctx() ctx: Context) {
		if (exportStatus.day > 0) {
			exportStatus.decreaseDay(1);
			await TelegramActions.editMessageReplyMarkup(ctx, 'selectSport', exportStatus.day.toString());
		}
	}

	@Action('bets_up')
	protected async betsUp(@Ctx() ctx: Context) {
		betAmount.increase(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'betAmount', betAmount.bets.toString());
	}

	@Action('bets_down')
	protected async betsDown(@Ctx() ctx: Context) {
		if (betAmount.bets > 7) {
			betAmount.decrease(1);
			await TelegramActions.editMessageReplyMarkup(ctx, 'betAmount', betAmount.bets.toString());
		}
	}

	@Action('export')
	protected async export(@Ctx() ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.exportStatisticDebounce();
	}

	@Action('exportFootball')
	protected async exportFootball(@Ctx() ctx: Context) {
		exportStatus.setName('football');
		await TelegramActions.inlineKeyboard(ctx, menuList('days', exportStatus.count.toString()));
	}

	@Action('enableBets')
	protected async enableBets(@Ctx() ctx: Context) {
		rateStatus.turnOn();
		await TelegramActions.sendAnswerText(ctx, 'Betting mechanism will be enabled');
		await this.telegramService.sendMessageSupport('Вкл ставки');
	}

	@Action('turnOffBets')
	protected async turnOffBets(@Ctx() ctx: Context) {
		rateStatus.turnOff();
		await TelegramActions.sendAnswerText(ctx, 'Betting mechanism will be stopped');
		await this.telegramService.sendMessageSupport('Выкл ставки');
	}

	@Action('debugBetLogs')
	protected async debugBetLogs(@Ctx() ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.getLogs('debug');
	}

	@Action('debugSeleniumLogs')
	protected async debugSeleniumLogs(@Ctx() ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.getLogsOtherServer();
	}

	@Action('errorBetLogs')
	protected async errorBetLogs(@Ctx() ctx: Context) {
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
			let stackUsually: Stack = await this.stackDBService.getDataByParam(StackType.UNUSUAL);
			let stackOften: Stack = await this.stackDBService.getDataByParam(StackType.OFTEN);
			activeEventIds = stackUsually.activeEventIds.length + stackOften.activeEventIds.length;
		} catch (error) {
			this.log.error(TelegramActions.name, `Error get active event ids`);
		}
		return activeEventIds;
	}
}
