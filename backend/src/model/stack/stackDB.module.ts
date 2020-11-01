import {Module} from '@nestjs/common';
import {StackDBService} from './stackDB.service';
import {MongooseModule} from '@nestjs/mongoose';
import {StackSchema} from './schemas/config.schema';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Stack',
				schema: StackSchema,
			},
		]),
	],
	providers: [StackDBService],
	exports: [StackDBService],
})
export class StackDBModule {}
