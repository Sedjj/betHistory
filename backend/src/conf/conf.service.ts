import { Injectable } from '@nestjs/common';
import { IConf } from './interfaces/conf.interface';

@Injectable()
export class ConfService {
	private readonly conf: IConf[] = [];

	create(cat: IConf) {
		this.conf.push(cat);
	}

	findAll(): IConf[] {
		return this.conf;
	}
}