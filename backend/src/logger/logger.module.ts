import {Module} from '@nestjs/common';
import {MyLogger} from './myLogger.service';

@Module({
	providers: [MyLogger],
	exports: [MyLogger],
})
export class LoggerModule {}
