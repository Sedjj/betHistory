import {Module} from '@nestjs/common';
import {BetsSimulatorService} from './betsSimulator.service';
import {TelegramBotModule} from '../telegram/telegramBot.module';

@Module({
	imports: [
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