import {Module} from '@nestjs/common';
import {StackDBService} from './stackDB.service';
import {MongooseModule} from '@nestjs/mongoose';
import {Stack, StackSchema} from './schemas/stack.schema';
import {LoggerModule} from '../../logger/logger.module';

@Module({
	imports: [
		LoggerModule,
		MongooseModule.forFeature([
			{
				name: Stack.name,
				schema: StackSchema,
			},
		]),
	],
	providers: [StackDBService],
	exports: [StackDBService],
})
export class StackDBModule {}
