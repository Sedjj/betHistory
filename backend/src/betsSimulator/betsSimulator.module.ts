import {Module} from '@nestjs/common';
import {BetsSimulatorService} from './betsSimulator.service';
import {ConfModule} from '../conf/conf.module';

@Module({
	imports: [
		ConfModule
	],
	providers: [
		BetsSimulatorService,
	],
	exports: [
		BetsSimulatorService,
	]
})
export class BetsSimulatorModule {
}