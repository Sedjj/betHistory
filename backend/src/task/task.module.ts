import {Module} from '@nestjs/common';
import {DataAnalysisModule} from '../dataAnalysis/dataAnalysis.module';
import {ScheduleModule} from '@nestjs/schedule';
import {TaskService} from './task.service';
import {FetchService} from '../fetch/fetch.service';
import {ParserFootballService} from '../parser/parserFootball.service';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		DataAnalysisModule
	],
	providers: [
		TaskService,
		FetchService,
		ParserFootballService
	],
	exports: [
		TaskService
	]
})
export class TaskModule {
}