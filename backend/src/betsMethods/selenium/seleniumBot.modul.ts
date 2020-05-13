import {Module} from '@nestjs/common';
import {SeleniumBotService} from './selenium.service';

@Module({
	providers: [
		SeleniumBotService,
	],
	exports: [
		SeleniumBotService,
	]
})
export class SeleniumModule {
}
