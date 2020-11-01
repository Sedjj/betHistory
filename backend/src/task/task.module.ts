import {Module} from '@nestjs/common';
import {DataAnalysisModule} from '../dataAnalysis/dataAnalysis.module';
import {ScheduleModule} from '@nestjs/schedule';
import {TaskService} from './task.service';
import {ParserFootballModule} from '../parser/parserFootball.modul';
import {SubscribeModule} from './queue/subscribe/subscribe.module';
import {StackModule} from './stack/stack.module';
/*import {PublishModule} from './queue/publish/publish.module';*/

@Module({
	imports: [
		ScheduleModule.forRoot(),
		DataAnalysisModule,
		ParserFootballModule,
		StackModule,
		SubscribeModule,
		/*PublishModule,*/
	],
	providers: [TaskService],
})
export class TaskModule {}
