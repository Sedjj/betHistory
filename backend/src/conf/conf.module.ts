import {Module} from '@nestjs/common';
import {ConfService} from './conf.service';
import {MongooseModule} from '@nestjs/mongoose';
import {ConfSchema} from './schemas/conf.schema';
import {ConfController} from './conf.controller';

@Module({
	imports: [
		MongooseModule.forFeature(
			[
				{
					name: 'Conf',
					schema: ConfSchema
				}
			]
		)
	],
	controllers: [ConfController],
	providers: [ConfService],
	exports: [ConfService]
})
export class ConfModule {
}