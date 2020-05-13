import {Module} from '@nestjs/common';
import {BetsSimulatorService} from './betsSimulator.service';
import {TelegramBotModule} from '../telegram/telegramBot.module';
import {BetfairModule} from '../betsMethods/betfair/betfair.module';

@Module({
	imports: [
		TelegramBotModule,
		BetfairModule
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