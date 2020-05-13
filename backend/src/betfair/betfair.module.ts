import {Module} from '@nestjs/common';
import {BetfairService} from './betfair.service';

@Module({
	providers: [
		BetfairService,
	],
	exports: [
		BetfairService,
	]
})
export class BetfairModule {
}
