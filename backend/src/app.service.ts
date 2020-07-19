import {Injectable} from '@nestjs/common';

@Injectable()
export class AppService {
	getCheckApi(): string {
		return 'Api successfully!';
	}
}
