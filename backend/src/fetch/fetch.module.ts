import {Module} from '@nestjs/common';
import {FetchService} from './fetch.service';
import {LoggerModule} from '../logger/logger.module';

@Module({
	imports: [LoggerModule],
	providers: [FetchService],
	exports: [FetchService],
})
export class FetchModule {}
