import {Module} from '@nestjs/common';
import {BetsSimulatorService} from './betsSimulator.service';
import {ConfModule} from '../conf/conf.module';
import {TelegramBotModule} from '../telegram/telegramBot.module';

@Module({
	imports: [
		ConfModule,
		TelegramBotModule
	],
	providers: [
		BetsSimulatorService,
	],
	exports: [
		BetsSimulatorService,
	]
})
export class BetsSimulatorModule {
}