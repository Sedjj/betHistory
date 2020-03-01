import {TelegrafModule, TelegrafService} from 'nestjs-telegraf';
import {HttpModule, Module, OnModuleInit} from '@nestjs/common';
import {ModuleRef} from '@nestjs/core';
import {TelegramActions} from './telegramActions.service';
import {TelegrafConfigService} from './telegraf-config.service';
import {ConfigModule} from '@nestjs/config';
import telegramBotConfig from './telegramBot.config';
import {TelegramService} from './telegram.service';
import {ExportModule} from '../export/export.module';

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
		private readonly telegraphService: TelegrafService,
	) {
	}

	onModuleInit() {
		const isDev = process.env.NODE_ENV === 'development';

		this.telegraphService.init(this.moduleRef);

		if (isDev) {
			// in dev mode, we can't use webhook
			this.telegraphService.startPolling();
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