import {TelegrafModule, TelegrafService} from 'nestjs-telegraf';
import {HttpModule, Module, OnModuleInit} from '@nestjs/common';
import {ModuleRef} from '@nestjs/core';
import {TelegramActions} from './telegramActions.service';
import {TelegrafConfigService} from './telegraf-config.service';
import {ConfigModule} from '@nestjs/config';
import telegramBotConfig from './telegramBot.config';
import {TelegramService} from './telegram.service';
import {ExportModule} from '../export/export.module';
import {ContextMessageUpdate} from 'telegraf';
import config from 'config';

@Module({
	imports: [
		HttpModule,
		TelegrafModule.fromFactory({
			imports: [ConfigModule.forFeature(telegramBotConfig)],
			useClass: TelegrafConfigService,
		}),
		ExportModule,
	],
	providers: [
		TelegrafModule,
		TelegramActions,
		TelegramService
	],
	exports: [
		TelegramService,
	]
})
export class TelegramBotModule implements OnModuleInit {
	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly telegrafService: TelegrafService,
	) {}

	onModuleInit() {
		const isDev = process.env.NODE_ENV === 'development';

		this.telegrafService.bot.use(
			this.accessCheck
		);
		this.telegrafService.init(this.moduleRef);
		if (!isDev) {
			// in dev mode, we can't use webhook
			this.telegrafService.startPolling();
		}
	}

	/**
	 * Проверка прав на доступ к меню.
	 *
	 * @param {ContextMessageUpdate} ctx объект что пришел из telegram
	 * @param {Object} next объект что пришел из telegram
	 */
	private async accessCheck(ctx: ContextMessageUpdate, next?: () => any) {
		let administrators: number[] = config.get<number[]>('roles.admin');
		const chat = ctx.chat != null ? ctx.chat.id : ctx.from != null ? ctx.from.id : 0;
		if (administrators.some((user) => user === chat) && next) {
			next();
		}
	}
}