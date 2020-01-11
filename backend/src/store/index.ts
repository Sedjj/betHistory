import {BetAmount} from './betAmount';
import {CounterWaiting} from './counterWaiting';
import {RateStatus} from './rateStatus';
import {AuthPhone} from './authPhone';

const rateAmount: BetAmount = new BetAmount();
const counterWaiting: CounterWaiting = new CounterWaiting();
const rateStatus: RateStatus = new RateStatus();
const authPhone: AuthPhone = new AuthPhone();

export {
	rateAmount,
	counterWaiting,
	rateStatus,
	authPhone,
};