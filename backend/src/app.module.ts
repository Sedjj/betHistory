import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfService} from './conf/conf.service';
import {ConfController} from './conf/conf.controller';
import {TasksService} from './task/tasksService .service';
import {ScheduleModule} from '@nestjs/schedule';
import {TelegramBotModule} from './telegram/telegramBot.module';

@Module({
	imports: [TelegramBotModule, ScheduleModule.forRoot()],
	controllers: [AppController, ConfController],
	providers: [
		AppService,
		ConfService,
		TasksService
	],
})
export class AppModule {
}