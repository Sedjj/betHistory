import {Injectable, Logger} from '@nestjs/common';
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
import {authPhone, betAmount, exportStatus, rateStatus} from '../store';
import config from 'config';
import {IKeyboardButton, IMenuBot} from './type/telegram.type';
import {menuList} from './menu';
import {TelegramService} from './telegram.service';
import {ExportService} from '../export/export.service';
import {StackService} from '../model/stack/stack.service';
import {IStack} from '../model/stack/type/stack.type';

@Injectable()
export class TelegramActions {
	private readonly logger = new Logger(TelegramActions.name);
	private readonly storagePath: string;
	private readonly logsDirectory: string;

	private readonly buttons: any = {
		waiting: 'Сколько матчей в ожидании',
		selectSport: 'Вид спорта',
		rate: 'Ставки',
		getFile: 'Получить файл',
		betAmount: 'Сумма ставки',
		verification: 'Проверку входа в систему',
	};

	constructor(
		@InjectBot() private bot: TelegrafProvider,
		private readonly telegramService: TelegramService,
		private readonly exportService: ExportService,
		private readonly stackService: StackService,
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
			[this.buttons.verification],
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
			this.logger.log(JSON.stringify(me));
			await this.sendText(ctx, 'Hi, choose action!');
		} catch (error) {
			this.logger.error(`Error start -> ${error}`);
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

	@TelegrafHears(/code-(\d{4,6})/)
	protected async code(ctx: Context) {
		if (ctx.message && ctx.message.text) {
			const code = ctx.message.text.split('-')[1];
			if (code) {
				authPhone.setCode(code);
			}
		}
	}

	@TelegrafHears(/tel-(\d{8})/)
	protected async phone(ctx: Context) {
		if (ctx.message && ctx.message.text) {
			const phone = ctx.message.text.split('-')[1];
			if (phone) {
				authPhone.setPhone(phone);
			}
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

	@TelegrafHears('Проверку входа в систему')
	protected async verification(ctx: Context) {
		await TelegramActions.inlineKeyboard(ctx, menuList('verification'));
	}

	@TelegrafAction('up')
	protected async up(ctx: Context) {
		exportStatus.increase(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
	}

	@TelegrafAction('down')
	protected async down(ctx: Context) {
		if (exportStatus.count > 2) {
			exportStatus.decrease(1);
			await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
		}
	}

	@TelegrafAction('upBets')
	protected async upBets(ctx: Context) {
		betAmount.increase(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'betAmount', betAmount.bets.toString());
	}

	@TelegrafAction('downBets')
	protected async downBets(ctx: Context) {
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
	}

	@TelegrafAction('turnOffBets')
	protected async turnOffBets(ctx: Context) {
		rateStatus.turnOff();
		await TelegramActions.sendAnswerText(ctx, 'Betting mechanism will be stopped');
	}

	@TelegrafAction('debugLogs')
	protected async debugLogs(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.getLogs('debug');
	}

	@TelegrafAction('errorLogs')
	protected async errorLogs(ctx: Context) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.getLogs('error');
	}

	@TelegrafAction('enableVerification')
	protected async enableVerification(ctx: Context) {
		authPhone.turnOn();
		await TelegramActions.sendAnswerText(ctx, 'Enable login verification');
	}

	@TelegrafAction('turnOffVerification')
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
			parse_mode: 'Markdown',
		});
	}

	/**
	 * Общий метод для экспорта.
	 */
	private async exportStatisticDebounce(): Promise<void> {
		try {
			if (exportStatus.name === 'football') {
				const stream: string = await this.exportService.exportFootballStatistic(exportStatus.count);
				await this.telegramService.sendFile(stream);
			}
		} catch (error) {
			this.logger.error(`Error exportStatisticDebounce: ${error}`);
		}
		exportStatus.clear();
	}

	/**
	 * Метод для получения лог файла.
	 */
	private async getLogs(name: string): Promise<void> {
		try {
			await this.telegramService.sendFile(path.join(this.storagePath, this.logsDirectory, `${name}.log`));
		} catch (error) {
			this.logger.error(`Error getLogs -> ${error}`);
		}
	}

	private async getActiveEvent(): Promise<number> {
		let activeEventIds: number = 0;
		try {
			let model: IStack = await this.stackService.getDataByParam(1);
			activeEventIds = model.activeEventIds.length;
		} catch (error) {
			this.logger.error(`Error get active event ids`);
		}
		return activeEventIds;
	}
}
