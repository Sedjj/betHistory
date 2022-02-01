import {Module} from '@nestjs/common';
import {ParserFootballService} from './parserFootball.service';
import {FetchService} from './fetch.service';
import {LoggerModule} from '../logger/logger.module';

@Module({
	imports: [LoggerModule],
	providers: [ParserFootballService, FetchService],
	exports: [ParserFootballService, FetchService],
})
export class ParserFootballModule {}
