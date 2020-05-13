import {ITime} from '../type/conf.type';

export class CreateConfDto {
	public readonly betAmount: number;
	public readonly time: ITime[];
	public readonly typeRate: number[];
	public readonly rate: number[];

	constructor() {
		this.betAmount = 300;
		this.typeRate = [
			1.5,
			1.5,
			2
		];
		this.rate = [
			2,
			10,
			3.5
		];
		this.time = [
			{
				before: 0,
				after: 0
			},
			{
				before: 2700,
				after: 4500
			},
			{
				before: 2700,
				after: 4500
			},
			{
				before: 0,
				after: 4500
			},
			{
				before: 2700,
				after: 4500
			},
			{
				before: 2700,
				after: 4500
			},
			{
				before: 1800,
				after: 4500
			},
			{
				before: 2600,
				after: 2800
			}
		];
	}
}