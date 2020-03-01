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
})
export class TelegramBotModule implements OnModuleInit {
	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly telegrafService: TelegrafService,
	) {
	}

	onModuleInit() {
		const isDev = process.env.NODE_ENV === 'development';

		this.telegrafService.init(this.moduleRef);

		if (isDev) {
			// in dev mode, we can't use webhook
			this.telegrafService.startPolling();
		}
	}
}