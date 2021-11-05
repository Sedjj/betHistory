import {Module} from '@nestjs/common';
import {FiltersService} from './filters.service';
import {MongooseModule} from '@nestjs/mongoose';
import {FiltersSchema} from './schemas/filters.schema';
import {FiltersController} from './filters.controller';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Filters',
				schema: FiltersSchema,
			},
		]),
	],
	controllers: [FiltersController],
	providers: [FiltersService],
	exports: [FiltersService],
})
export class FiltersModule {}
