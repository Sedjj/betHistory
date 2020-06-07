import {Injectable, Logger} from '@nestjs/common';
import path from 'path';
import {ContextMessageUpdate} from 'telegraf';
import {TelegrafTelegramService, TelegramActionHandler} from 'nestjs-telegraf';
import {authPhone, counterWaiting, exportStatus, rateAmount, rateStatus} from '../store';
import config from 'config';
import {IKeyboardButton, IMenuBot} from './type/telegram.type';
import {menuList} from './menu';
import {TelegramService} from './telegram.service';
import {ExportService} from '../export/export.service';
import {RateLimit} from 'nestjs-rate-limiter';

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
		private readonly telegrafService: TelegrafTelegramService,
		private readonly telegramService: TelegramService,
		private readonly exportService: ExportService
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
	 * @param {ContextMessageUpdate} ctx контекст ответа
	 * @param {IMenuBot} msg объект подменю
	 */
	private static async inlineKeyboard(ctx: ContextMessageUpdate, msg: IMenuBot): Promise<void> {
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
	 * @param {ContextMessageUpdate} ctx контекст ответа
	 * @param {String} text названиеы
	 */
	private static async sendAnswerText(ctx: ContextMessageUpdate, text: string): Promise<void> {
		await ctx.answerCbQuery(text, true);
	}

	/**
	 * Обертка для редактирования inline_keyboard в боте.
	 *
	 * @param {ContextMessageUpdate} ctx контекст ответа
	 * @param {String} text названиеы
	 * @param {String} count текст для замены
	 * @returns {Promise<void>}
	 */
	private static async editMessageReplyMarkup(ctx: ContextMessageUpdate, text: string, count: string): Promise<void> {
		await ctx.editMessageReplyMarkup({
			inline_keyboard: menuList(text, count).buttons
		});
	}

	@TelegramActionHandler({onStart: true})
	protected async start(ctx: ContextMessageUpdate) {
		if (!(ctx.message && ctx.message.text)) {
			return;
		}
		try {
			const me = await this.telegrafService.getMe();
			this.logger.log(JSON.stringify(me));
			this.sendText(ctx, 'Hi, choose action!');
		} catch (error) {
			this.logger.error(`Error start -> ${error}`);
		}

	}

	@TelegramActionHandler({message: /code-(\d{4,6})/})
	protected async code(ctx: ContextMessageUpdate) {
		if (ctx.message && ctx.message.text) {
			const code = ctx.message.text.split('-')[1];
			if (code) {
				authPhone.setCode(code);
			}
		}
	}

	@TelegramActionHandler({message: /tel-(\d{8})/})
	protected async phone(ctx: ContextMessageUpdate) {
		if (ctx.message && ctx.message.text) {
			const phone = ctx.message.text.split('-')[1];
			if (phone) {
				authPhone.setPhone(phone);
			}
		}
	}

	@TelegramActionHandler({message: 'Сколько матчей в ожидании'})
	protected async waiting(ctx: ContextMessageUpdate) {
		this.sendText(ctx, `Матчей ожидающих Total: ${counterWaiting.count}`);
	}

	@TelegramActionHandler({message: 'Вид спорта'})
	protected async selectSport(ctx: ContextMessageUpdate) {
		await TelegramActions.inlineKeyboard(ctx, menuList('selectSport'));
	}

	@TelegramActionHandler({message: 'Ставки'})
	protected async rate(ctx: ContextMessageUpdate) {
		await TelegramActions.inlineKeyboard(ctx, menuList('rate'));
	}

	@TelegramActionHandler({message: 'Получить файл'})
	protected async getFile(ctx: ContextMessageUpdate) {
		await TelegramActions.inlineKeyboard(ctx, menuList('getFile'));
	}

	@TelegramActionHandler({message: 'Сумма ставки'})
	protected async betAmount(ctx: ContextMessageUpdate) {
		await TelegramActions.inlineKeyboard(ctx, menuList('betAmount', rateAmount.bets.toString()));
	}

	@TelegramActionHandler({message: 'Проверку входа в систему'})
	protected async verification(ctx: ContextMessageUpdate) {
		await TelegramActions.inlineKeyboard(ctx, menuList('verification'));
	}

	@TelegramActionHandler({action: 'up'})
	protected async up(ctx: ContextMessageUpdate) {
		exportStatus.increase(1);
		await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
	}

	@TelegramActionHandler({action: 'down'})
	protected async down(ctx: ContextMessageUpdate) {
		if (exportStatus.count > 2) {
			exportStatus.decrease(1);
			await TelegramActions.editMessageReplyMarkup(ctx, 'days', exportStatus.count.toString());
		}
	}

	@TelegramActionHandler({action: 'upBets'})
	protected async upBets(ctx: ContextMessageUpdate) {
		rateAmount.increase(10);
		await TelegramActions.editMessageReplyMarkup(ctx, 'betAmount', rateAmount.bets.toString());
	}

	@TelegramActionHandler({action: 'downBets'})
	protected async downBets(ctx: ContextMessageUpdate) {
		if (rateAmount.bets > 10) {
			rateAmount.decrease(10);
			await TelegramActions.editMessageReplyMarkup(ctx, 'betAmount', rateAmount.bets.toString());
		}
	}

	@RateLimit({ points: 1, duration: 20 })
	@TelegramActionHandler({action: 'export'})
	protected async export(ctx: ContextMessageUpdate) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.exportStatisticDebounce();
	}

	@TelegramActionHandler({action: 'exportFootball'})
	protected async exportFootball(ctx: ContextMessageUpdate) {
		exportStatus.setName('football');
		await TelegramActions.inlineKeyboard(ctx, menuList('days', exportStatus.count.toString()));
	}

	@TelegramActionHandler({action: 'enableBets'})
	protected async enableBets(ctx: ContextMessageUpdate) {
		rateStatus.turnOn();
		await TelegramActions.sendAnswerText(ctx, 'Betting mechanism will be enabled');
	}

	@TelegramActionHandler({action: 'turnOffBets'})
	protected async turnOffBets(ctx: ContextMessageUpdate) {
		rateStatus.turnOff();
		await TelegramActions.sendAnswerText(ctx, 'Betting mechanism will be stopped');
	}

	@TelegramActionHandler({action: 'debugLogs'})
	protected async debugLogs(ctx: ContextMessageUpdate) {
		await TelegramActions.sendAnswerText(ctx, 'Ожидайте файл');
		await this.getLogs();
	}

	@TelegramActionHandler({action: 'enableVerification'})
	protected async enableVerification(ctx: ContextMessageUpdate) {
		authPhone.turnOn();
		await TelegramActions.sendAnswerText(ctx, 'Enable login verification');
	}

	@TelegramActionHandler({action: 'turnOffVerification'})
	protected async turnOffVerification(ctx: ContextMessageUpdate) {
		authPhone.turnOff();
		await TelegramActions.sendAnswerText(ctx, 'Stopped login verification');
	}

	/**
	 * Обертка для отправки сообщения в бот.
	 *
	 * @param {ContextMessageUpdate} ctx контекст ответа
	 * @param {String} text текст для отправки
	 */
	private async sendText(ctx: ContextMessageUpdate, text: string): Promise<void> {
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
	private async getLogs(): Promise<void> {
		try {
			await this.telegramService.sendFile(path.join(this.storagePath, this.logsDirectory, 'debug.log'));
		} catch (error) {
			this.logger.error(`Error getLogs -> ${error}`);
		}
	}
}