import {Module} from '@nestjs/common';
import {SeleniumBotService} from './selenium.service';

@Module({
	imports: [
		SeleniumBotService
	],
	providers: [
		SeleniumBotService,
	],
	exports: [
		SeleniumBotService,
	]
})
export class SeleniumModule {
}
