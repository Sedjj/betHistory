import {Module} from '@nestjs/common';
import {ExportService} from './export.service';
import {FootballModule} from '../model/football/football.module';
import {LoggerModule} from '../logger/logger.module';

@Module({
	imports: [FootballModule, LoggerModule],
	providers: [ExportService],
	exports: [ExportService],
})
export class ExportModule {}
