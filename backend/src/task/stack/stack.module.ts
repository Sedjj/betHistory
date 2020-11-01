import {Module} from '@nestjs/common';
import {StackDBModule} from '../../model/stack/stackDB.module';
import {StackService} from './stack.service';

@Module({
	imports: [StackDBModule],
	providers: [StackService],
	exports: [StackService],
})
export class StackModule {}
