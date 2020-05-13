import {Module} from '@nestjs/common';
import {StackService} from './stack.service';
import {MongooseModule} from '@nestjs/mongoose';
import {StackSchema} from './schemas/config.schema';

@Module({
	imports: [
		MongooseModule.forFeature(
			[
				{
					name: 'Stack',
					schema: StackSchema
				}
			]
		)
	],
	providers: [StackService],
	exports: [StackService]
})
export class StackModule {
}