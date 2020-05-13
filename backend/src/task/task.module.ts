import {Module} from '@nestjs/common';
import {DataAnalysisModule} from '../dataAnalysis/dataAnalysis.module';
import {ScheduleModule} from '@nestjs/schedule';
import {TaskService} from './task.service';
import {ParserFootballModule} from '../parser/parserFootball.modul';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		DataAnalysisModule,
		ParserFootballModule
	],
	providers: [
		TaskService,
	]
})
export class TaskModule {
}