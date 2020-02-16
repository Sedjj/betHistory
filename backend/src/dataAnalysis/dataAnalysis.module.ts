import {Module} from '@nestjs/common';
import {DataAnalysisService} from './dataAnalysis.service';
import {BetsSimulatorModule} from '../betsSimulator/betsSimulator.module';
import {ConfModule} from '../conf/conf.module';
import {FootballModule} from '../football/football.module';

@Module({
	imports: [
		BetsSimulatorModule,
		ConfModule,
		FootballModule,
	],
	providers: [
		DataAnalysisService
	],
	exports: [
		DataAnalysisService
	]
})
export class DataAnalysisModule {
}