import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {TaskModule} from './task/task.module';
import {MongooseModule} from '@nestjs/mongoose';
import config from 'config';

const dbUri =
	process.env.NODE_ENV === 'development'
		? `mongodb://${config.get<string>('dbDev.hostString')}${config.get<string>('dbDev.name')}`
		: `mongodb://${config.get<string>('dbProd.user')}:${config.get<string>(
				'dbProd.pass',
		  )}@${config.get<string>('dbProd.hostString')}${config.get<string>(
				'dbProd.name',
		  )}?directConnection=true`;

@Module({
	imports: [ConfigModule.forRoot(), MongooseModule.forRoot(dbUri), TaskModule],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule {}
