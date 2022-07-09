import path from 'path';
import {Action, Ctx, Hears, InjectBot, Start, Update} from 'nestjs-telegraf';
import {betAmount, exportStatus, rateStatus} from '../store';
import config from 'config';
import {IMenuBot} from './type/telegram.type';
import {menuList} from './menu';
import {TelegramService} from './telegram.service';
import {ExportService} from '../export/export.service';
import {StackDBService} from '../model/stack/stackDB.service';
import {StackType} from '../model/stack/type/stack.type';
import {FetchService} from '../fetch/fetch.service';
import {MyLogger} from '../logger/myLogger.service';
import {Context, Telegraf} from 'telegraf';
import {Stack} from '../model/stack/schemas/stack.schema';
import {KeyboardButton} from 'typegram/markup';

@Update()
export class TelegramActions {
	private readonly storagePath: string;
	private readonly logsDirectory: string;

	private readonly buttons: any = {
		waiting: 'Сколько матчей в ожидании',
		export: 'Export',
		rate: 'Ставки',
		getFile: 'Get debug log',
		betAmount: 'Сумма ставки',
		systemFunctions: 'System functions',
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
		this.bot.use(this.accessCheck);
	}

	private get keyboard(): KeyboardButton[][] {
		return [
			[this.buttons.waiting],
			[this.buttons.getFile, this.buttons.export],
			[this.buttons.rate, this.buttons.betAmount],
			[this.buttons.systemFunctions],
		];
	}

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

	private static async editMessageReplyMarkup(ctx: Context, msg: IMenuBot): Promise<void> {
		await ctx.editMessageReplyMarkup({
			inline_keyboard: msg.buttons,
		});
	}

	@Start()
	protected async start(@Ctx() ctx: Context) {
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
		return;
	}

	protected accessCheck = async (ctx: Context, next?: () => any) => {
		let administrators: number[] = config.get<number[]>('roles.admin');
		const chat = ctx.chat != null ? ctx.chat.id : ctx.from != null ? ctx.from.id : 0;
		if (administrators.some(user => user === chat) && next) {
			await next();
		} else {
			this.log.error(TelegramActions.name, `You(${chat}) are not admin 😡`);
		}
	};

	@Hears('Сколько матчей в ожидании')
	protected async waiting(@Ctx() ctx: Context) {
		await this.sendText(ctx, `Матчей ожидающих Total: ${await this.getActiveEvent()}`);
	}

	@Hears('Export')
	protected async selectSport(@Ctx() ctx: Context) {
		exportStatus.setName('football');
		await TelegramActions.inlineKeyboard(
			ctx,
			menuList({
				item: 'selectSport',
				shiftInDays: exportStatus.day.toString(),
				amountOfDays: exportStatus.count.toString(),
			}),
		);
	}

	@Hears('Ставки')
	protected async rate(@Ctx() ctx: Context) {
		await TelegramActions.inlineKeyboard(
			ctx,
			menuList({
				item: 'rate',
			}),
		);
	}

	@Hears('Get debug log')
	protected async getFile(@Ctx() ctx: Context) {
		await TelegramActions.inlineKeyboard(
			ctx,
			menuList({
				item: 'getFile',
			}),
		);
	}

	@Hears('Сумма ставки')
	protected async betAmount(@Ctx() ctx: Context) {
		await TelegramActions.inlineKeyboard(
			ctx,
			menuList({
				item: 'betAmount',
				betAmount: betAmount.bets.toString(),
			}),
		);
	}

	@Hears('System functions')
	protected async systemFunctions(@Ctx() ctx: Context) {
		await TelegramActions.inlineKeyboard(
			ctx,
			menuList({
				item: 'systemFunctions',
			}),
		);
	}

	@Action('up')
	protected async up(@Ctx() ctx: Context) {
		exportStatus.increase(1);
		await TelegramActions.editMessageReplyMarkup(
			ctx,
			menuList({
				item: 'selectSport',
				shiftInDays: exportStatus.day.toString(),
				amountOfDays: exportStatus.count.toString(),
			}),
		);
	}

	@Action('down')
	protected async down(@Ctx() ctx: Context) {
		if (exportStatus.count > 0) {
			exportStatus.decrease(1);
			await TelegramActions.editMessageReplyMarkup(
				ctx,
				menuList({
					item: 'selectSport',
					shiftInDays: exportStatus.day.toString(),
					amountOfDays: exportStatus.count.toString(),
				}),
			);
		}
	}

	@Action('day_up')
	protected async upDay(@Ctx() ctx: Context) {
		exportStatus.increaseDay(1);
		await TelegramActions.editMessageReplyMarkup(
			ctx,
			menuList({
				item: 'selectSport',
				shiftInDays: exportStatus.day.toString(),
				amountOfDays: exportStatus.count.toString(),
			}),
		);
	}

	@Action('day_down')
	protected async downDay(@Ctx() ctx: Context) {
		if (exportStatus.day > 0) {
			exportStatus.decreaseDay(1);
			await TelegramActions.editMessageReplyMarkup(
				ctx,
				menuList({
					item: 'selectSport',
					shiftInDays: exportStatus.day.toString(),
					amountOfDays: exportStatus.count.toString(),
				}),
			);
		}
	}

	@Action('bets_up')
	protected async betsUp(@Ctx() ctx: Context) {
		betAmount.increase(1);
		await TelegramActions.editMessageReplyMarkup(
			ctx,
			menuList({
				item: 'betAmount',
				betAmount: betAmount.bets.toString(),
			}),
		);
	}

	@Action('bets_down')
	protected async betsDown(@Ctx() ctx: Context) {
		if (betAmount.bets > 7) {
			betAmount.decrease(1);
			await TelegramActions.editMessageReplyMarkup(
				ctx,
				menuList({
					item: 'betAmount',
					betAmount: betAmount.bets.toString(),
				}),
			);
		}
	}

	@Action('export')
	protected async export(@Ctx() ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.exportStatisticDebounce();
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

	@Action('confirmStartCleaningBD')
	protected async confirmStartCleaningBD(@Ctx() ctx: Context) {
		await TelegramActions.inlineKeyboard(
			ctx,
			menuList({
				item: 'clearBD',
			}),
		);
	}

	@Action('startClearBD')
	protected async startClearBD(@Ctx() ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Database cleanup started');
		await this.telegramService.sendMessageSupport('Запущено очищение БД');
		// TODO добавить скрипт
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

	private async exportStatisticDebounce(): Promise<void> {
		try {
			if (exportStatus.name === 'football') {
				const file = await this.exportService.exportFootballStatisticStream(
					exportStatus.count,
					exportStatus.day,
				);
				await this.telegramService.sendFileOfBuffer(file.buffer, file.filename);
			}
		} catch (error) {
			this.log.error(TelegramActions.name, `Error exportStatisticDebounce: ${error}`);
		}
		exportStatus.clear();
	}

	private async getLogsOtherServer(): Promise<void> {
		try {
			const file = await this.fetchService.getLogOtherServer();
			await this.telegramService.sendFileOfBuffer(file, 'debug_selenium.log');
		} catch (error) {
			this.log.error(TelegramActions.name, `Error getLogs -> ${error}`);
		}
	}

	private async getLogs(name: string): Promise<void> {
		try {
			await this.telegramService.sendFile(
				path.join(this.storagePath, this.logsDirectory, `${name}.log`),
			);
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
