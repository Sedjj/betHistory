import {BetAmount} from './betAmount';
import {CounterWaiting} from './counterWaiting';
import {RateStatus} from './rateStatus';
import {AuthPhone} from './authPhone';
import {ExportStatus} from './exportStatus';

const rateAmount: BetAmount = new BetAmount();
const counterWaiting: CounterWaiting = new CounterWaiting();
const rateStatus: RateStatus = new RateStatus();
const authPhone: AuthPhone = new AuthPhone();
const exportStatus: ExportStatus = new ExportStatus();

export {
	rateAmount,
	counterWaiting,
	rateStatus,
	authPhone,
	exportStatus,
};