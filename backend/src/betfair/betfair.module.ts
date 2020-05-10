import {Module} from '@nestjs/common';
import {BetfairService} from './betfair.service';

@Module({
	imports: [
		BetfairService
	],
	providers: [
		BetfairService,
	],
	exports: [
		BetfairService,
	]
})
export class BetfairModule {
}
