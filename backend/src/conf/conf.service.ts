import {Injectable} from '@nestjs/common';
import {IConf, IRateStrategy, ITime} from './type/conf.type';

@Injectable()
export class ConfService {
	private readonly conf: IConf[] = [];

	create(cat: IConf) {
		this.conf.push(cat);
	}

	findAll(): IConf[] {
		return this.conf;
	}

	getTypeRate(strategy: number): number {
		return [
			1.5,
			1.5,
			2
		][strategy];
	}

	getRateStrategy(strategy: number): IRateStrategy {
		return [
			{
				title: 'Math.abs(p1 - p2) < rate',
				rate: 0
			},
			{
				title: 'Math.abs(p1 - p2) < rate',
				rate: 2
			},
			{
				title: 'Math.abs(p1 - p2) < rate',
				rate: 2
			},
			{
				title: 'Math.abs(p1 - p2) < rate',
				rate: 2
			},
		][strategy];
	}

	getTime(): ITime[] {
		return [
			{
				before: 0,
				after: 0
			},
			{
				before: 300,
				after: 600
			},
			{
				before: 1800,
				after: 2100
			},
			{
				before: 2700,
				after: 2700
			},
		];
	}
}