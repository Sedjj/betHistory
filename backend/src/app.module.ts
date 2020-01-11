import {HttpModule, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfService} from './conf/conf.service';
import {ConfController} from './conf/conf.controller';
import {TasksService} from './task/tasksService .service';
import {ScheduleModule} from '@nestjs/schedule';

/*import {BotService} from './telegram/bot/bot.service';*/

@Module({
	imports: [HttpModule, ScheduleModule.forRoot()],
	controllers: [AppController, ConfController],
	providers: [
		AppService,
		ConfService,
		TasksService,
		/*	BotService*/
	],
})
export class AppModule {
}