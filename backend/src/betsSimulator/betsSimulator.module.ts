import {Module} from '@nestjs/common';
import {BetsSimulatorService} from './betsSimulator.service';
import {TelegramBotModule} from '../telegram/telegramBot.module';
import {SeleniumApiModule} from '../betsMethods/seleniumApi/seleniumApi.module';

@Module({
	imports: [
		TelegramBotModule,
		SeleniumApiModule
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