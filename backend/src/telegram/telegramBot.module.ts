import {TelegrafModule} from 'nestjs-telegraf';
import {HttpModule} from '@nestjs/axios';
import {Module} from '@nestjs/common';
import {TelegramActions} from './telegramActions.service';
import {TelegramService} from './telegram.service';
import {ExportModule} from '../export/export.module';
import config from 'config';
import {StackDBModule} from '../model/stack/stackDB.module';
import {TelegramController} from './telegram.controller';
import {FetchModule} from '../fetch/fetch.module';
import {LoggerModule} from '../logger/logger.module';

let token: string;
if (process.env.NODE_ENV === 'development') {
	token = config.get<string>('bots.dev.token');
} else {
	token = config.get<string>('bots.prod.token');
}

@Module({
	imports: [LoggerModule, HttpModule, TelegrafModule.forRoot({token}), ExportModule, StackDBModule, FetchModule],
	controllers: [TelegramController],
	providers: [TelegramActions, TelegramService],
	exports: [TelegramService],
})
export class TelegramBotModule {}
