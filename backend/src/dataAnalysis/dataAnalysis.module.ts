import {Module} from '@nestjs/common';
import {DataAnalysisService} from './dataAnalysis.service';
import {BetsSimulatorModule} from '../betsSimulator/betsSimulator.module';
import {ConfModule} from '../model/conf/conf.module';
import {FootballModule} from '../model/football/football.module';
import {LoggerModule} from '../logger/logger.module';

@Module({
	imports: [BetsSimulatorModule, ConfModule, FootballModule, LoggerModule],
	providers: [DataAnalysisService],
	exports: [DataAnalysisService],
})
export class DataAnalysisModule {}
