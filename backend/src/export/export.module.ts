import {Module} from '@nestjs/common';
import {ExportService} from './export.service';
import {FootballModule} from '../model/football/football.module';

@Module({
	imports: [
		FootballModule
	],
	providers: [
		ExportService,
	],
	exports: [
		ExportService,
	]
})
export class ExportModule {
}