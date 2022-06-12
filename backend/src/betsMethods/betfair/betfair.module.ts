import {Module} from '@nestjs/common';
import {BetfairService} from './betfair.service';
import {LoggerModule} from '../../logger/logger.module';

@Module({
	imports: [LoggerModule],
	providers: [BetfairService],
	exports: [BetfairService],
})
export class BetfairModule {}
