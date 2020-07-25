import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {TaskModule} from './task/task.module';
import {TelegramBotModule} from './telegram/telegramBot.module';
import {MongooseModule} from '@nestjs/mongoose';
import config from 'config';

const dbUri =
	process.env.NODE_ENV === 'development'
		? `mongodb://${config.get<string>('dbDev.hostString')}${config.get<string>('dbDev.name')}`
		: `mongodb://${config.get<string>('dbProd.user')}:${config.get<string>('dbProd.pass')}@${config.get<string>(
				'dbProd.hostString',
		  )}${config.get<string>('dbProd.name')}`;

@Module({
	imports: [
		ConfigModule.forRoot(),
		MongooseModule.forRoot(dbUri, {
			useNewUrlParser: true,
			useFindAndModify: false,
			useUnifiedTopology: true,
		}),
		TelegramBotModule,
		TaskModule,
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
