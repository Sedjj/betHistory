import {Module} from '@nestjs/common';
import {DataAnalysisModule} from '../dataAnalysis/dataAnalysis.module';
import {ScheduleModule} from '@nestjs/schedule';
import {TaskService} from './task.service';
import {ParserFootballModule} from '../parser/parserFootball.modul';
import {StackModule} from './stack/stack.module';
import {LoggerModule} from '../logger/logger.module';
import {ConfModule} from '../model/conf/conf.module';
import {TelegramBotModule} from '../telegram/telegramBot.module';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		DataAnalysisModule,
		ParserFootballModule,
		StackModule,
		LoggerModule,
		ConfModule,
		TelegramBotModule,
	],
	providers: [TaskService],
})
export class TaskModule {}
