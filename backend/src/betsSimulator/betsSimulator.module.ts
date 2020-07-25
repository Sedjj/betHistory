import {Module} from '@nestjs/common';
import {BetsSimulatorService} from './betsSimulator.service';
import {TelegramBotModule} from '../telegram/telegramBot.module';
import {FetchModule} from '../fetch/fetch.module';

@Module({
	imports: [TelegramBotModule, FetchModule],
	providers: [BetsSimulatorService],
	exports: [BetsSimulatorService],
})
export class BetsSimulatorModule {}
