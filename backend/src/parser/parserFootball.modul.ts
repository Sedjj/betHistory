import {Module} from '@nestjs/common';
import {ParserFootballService} from './parserFootball.service';
import {FetchService} from './fetch.service';

@Module({
	providers: [
		ParserFootballService,
		FetchService,
	],
	exports: [
		ParserFootballService,
		FetchService,
	]
})
export class ParserFootballModule {
}
