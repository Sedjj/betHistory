import {Module} from '@nestjs/common';
import {StackDBModule} from '../../model/stack/stackDB.module';
import {StackService} from './stack.service';
import {LoggerModule} from '../../logger/logger.module';

@Module({
	imports: [StackDBModule, LoggerModule],
	providers: [StackService],
	exports: [StackService],
})
export class StackModule {}
