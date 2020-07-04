import {Module} from '@nestjs/common';
import {SeleniumApiService} from './seleniumApi.service';

@Module({
	providers: [
		SeleniumApiService
	],
	exports: [
		SeleniumApiService,
	]
})
export class SeleniumApiModule {
}