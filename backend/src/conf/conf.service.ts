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
		][strategy - 1];
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
		][strategy - 1];
	}

	getTime(strategy: number): ITime {
		return [
			{
				before: 0,
				after: 0
			},
			{
				before: 5,
				after: 10
			},
			{
				before: 30,
				after: 35
			},
			{
				before: 45,
				after: 45
			},
			{
				before: 20,
				after: 45
			},
		][strategy - 1];
	}
}