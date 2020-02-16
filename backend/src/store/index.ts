import {BetAmount} from './betAmount';
import {CounterWaiting} from './counterWaiting';
import {RateStatus} from './rateStatus';
import {AuthPhone} from './authPhone';
import {ExportStatus} from './exportStatus';

let rateAmount: BetAmount = new BetAmount();
let counterWaiting: CounterWaiting = new CounterWaiting();
let rateStatus: RateStatus = new RateStatus();
let authPhone: AuthPhone = new AuthPhone();
let exportStatus: ExportStatus = new ExportStatus();

export {
	rateAmount,
	counterWaiting,
	rateStatus,
	authPhone,
	exportStatus,
};