import {TelegramModule} from 'nest-telegram';
import {TelegramOptionsFactory} from './telegramOptionsFactory';
import {HttpModule, Module, OnModuleInit} from '@nestjs/common';
import {TelegramBot} from 'nest-telegram';
import {ModuleRef} from '@nestjs/core';
import {SomethingActions} from './somethingActions.service';
import {CurrentSender} from './сurrentSender.service';
import {HelpActions} from './helpActions.service';

@Module({
	imports: [
		HttpModule,
		TelegramModule.fromFactory({
			useClass: TelegramOptionsFactory,
		}),
	],
	providers: [
		SomethingActions,
		CurrentSender,
		HelpActions,
		/*	BotService*/
	],
})
export class TelegramBotModule implements OnModuleInit {
	constructor(
		private readonly moduleRef: ModuleRef,
		private readonly telegramBot: TelegramBot,
	) {
	}

	onModuleInit() {
		const isDev = process.env.NODE_ENV === 'development';

		this.telegramBot.init(this.moduleRef);

		if (isDev) {
			// in dev mode, we can't use webhook
			this.telegramBot.startPolling();
		}
	}
}