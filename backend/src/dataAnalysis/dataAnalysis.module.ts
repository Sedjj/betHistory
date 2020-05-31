import {Module} from '@nestjs/common';
import {DataAnalysisService} from './dataAnalysis.service';
import {BetsSimulatorModule} from '../betsSimulator/betsSimulator.module';
import {ConfModule} from '../model/conf/conf.module';
import {FootballModule} from '../model/football/football.module';
import {ParserFootballModule} from '../parser/parserFootball.modul';

@Module({
	imports: [
		BetsSimulatorModule,
		ConfModule,
		FootballModule,
		ParserFootballModule
	],
	providers: [
		DataAnalysisService,
	],
	exports: [
		DataAnalysisService
	]
})
export class DataAnalysisModule {
}