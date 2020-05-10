import config from 'config';
import {rateAmount, rateStatus} from '../store';
import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {Auth, LayOrBack, Speed} from './type/selenium.type';
import {
	driverChrome,
	findCssAndCall,
	findIdAndCall,
	findIdAndFill,
	findSelectorCss,
	findSelectorCssAndFill,
	init,
	isElementByCss,
	screenShot
} from './seleniumApi';
import {WebDriver} from 'selenium-webdriver';
import {TelegramService} from '../telegram/telegram.service';

@Injectable()
export class SeleniumBotService implements OnApplicationBootstrap {
	private readonly logger = new Logger(SeleniumBotService.name);
	/**
	 * Массив интервалов в миллисекундах после которых делается попытка снова
	 */
	private readonly searchTimeouts: number[] = [2000, 5000, 8000, 12000, 1];
	private speed: Speed = {
		veryFast: 500,
		fast: 1000,
		normal: 10000,
		slow: 20 * 1000,
		verySlow: 40 * 1000,
		waitingForCode: 120 * 1000,
	};
	private auth: Auth;
	private readonly nameBot: string;
	private readonly urlStartPage: string;

	constructor(
		private readonly telegramService: TelegramService
	) {
		this.auth = config.get<Auth>('auth');
		if (process.env.NODE_ENV === 'development') {
			this.nameBot = config.get<string>('bots.dev.name');
		} else {
			this.nameBot = config.get<string>('bots.prod.name');
		}
		this.urlStartPage = config.get<string>('parser.startPage');
	}

	async onApplicationBootstrap() {
		await this.performEmulation();
	}

	/**
	 * Эмулмирует работу на PC.
	 *
	 * @param {Number} marketId идентификатор матча
	 * @param {Number} numberColumn номер столбца тотала
	 * @param {String} totalName искомая ставка
	 * @returns {Promise<void>}
	 */
	async performEmulation(marketId: number, numberColumn: number, totalName: string) {
		if (!rateStatus.status) {
			return;
		}
		/*	{
				"marketId": "1.170380271",
				"marketType": "FIRST_HALF_GOALS_05"
			},*/
		let driver: WebDriver | null = null;
		try {
			this.logger.debug(`Rate match ${marketId} with '${totalName}'`);
			driver = await driverChrome();
			await init(driver);
			await driver.get(this.urlStartPage.replace('${marketId}', marketId.toString()));
			if (await this.authorization(driver)) {
				this.logger.debug('Authorization successfully');
				for (const timeoutOne of this.searchTimeouts) {
					for (const timeoutTwo of this.searchTimeouts) {
						if (await this.searchRate(driver, numberColumn, totalName)) {
							break;
						}
						this.logger.debug(`Search rate sleep on ${timeoutTwo}ms`);
						await driver.sleep(timeoutTwo);
					}
					this.logger.debug(`Search did not find match or close promo modal - sleep on ${timeoutOne}ms`);
					await driver.sleep(timeoutOne);
				}
			}
			await screenShot(driver, `${(new Date()).getTime()}.png`, this.nameBot, this.sendPhoto);
			await driver.sleep(this.speed.fast);
			await driver.quit();
		} catch (e) {
			this.logger.error(`Error performEmulation ->  ${JSON.stringify(e)}`);
			if (driver) {
				await screenShot(driver, `${(new Date()).getTime()}.png`, this.nameBot, this.sendPhoto);
				await driver.sleep(this.speed.fast);
				await driver.quit();
			}
		}
	}

	/**
	 * Метод для авторизации пользователя.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @returns {Promise<boolean>}
	 */
	private async authorization(driver: WebDriver): Promise<boolean> {
		await driver.sleep(this.speed.fast);
		if (!await findIdAndCall(driver, 'curLoginForm')) {
			if (await findSelectorCss(driver, '.wrap_lk')) {
				return true;
			}
		} else {
			await findIdAndFill(driver, 'auth_id_email', this.auth.login);
			await findIdAndFill(driver, 'auth-form-password', this.auth.password);
			if (await findCssAndCall(driver, '.auth-button.auth-button--block')) {
				await driver.sleep(this.speed.fast);
				await this.waitLoadPage(driver);
				return true;
			}
		}
		await this.sendNotification('Authorization failed');
		return false;
	}

	/**
	 * Метод для поиска матча на странице.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @param {Number} marketId идентификатор матча
	 * @returns {Promise<boolean>}
	 */
	/*private async search(driver: WebDriver, marketId: number): Promise<boolean> {
		try {
			if (
				await findSelectorCss(driver, `.coupon-table > .mod-link[data-market-id="${marketId}"]`)
				&& await findSelectorCss(driver, '.wrap_lk')    // TODO что авторизован
			) {
				if (await findCssAndCall(driver, `[data-market-id="${marketId}"]`)) {
					return true;
				} else {
					await this.sendNotification('Current match not found');
					return false;
				}
			}
		} catch (e) {
			console.log(`Search match failed - ${JSON.stringify(e)}`);
		}
		await this.sendNotification('Search match failed');
		return false;
	}*/

	/**
	 * Метод для поиска нужного коэфициента для ставки.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @param {LayOrBack} layOrBack флаг за или против
	 * @param {Number} price коэффициент ставки
	 * @param {Number} size искомая ставка
	 * @returns {Promise<boolean>}
	 */
	private async searchRate(driver: WebDriver, layOrBack: LayOrBack, price: number, size: number) {
		if (
			await findSelectorCss(driver, `.${layOrBack}lay-selection-button`)
			&& await findSelectorCss(driver, '.wrap_lk')    // TODO что авторизован
		) {
			if (!await isElementByCss(driver, `.${layOrBack}lay-selection-button[price="${price}"]`)) {
				try {
					if (await findCssAndCall(driver, `.${layOrBack}lay-selection-button[price="${price}"]`)) {
						return await this.rate(driver);
					} else {
						await this.sendNotification('Current rate not found');
						return false;
					}
				} catch (e) {
					await this.sendNotification(`Rate locked on current match: ${JSON.stringify(e)}`);
					return false;
				}
			}
			await this.sendNotification(`Rate ${price} locked on current match`);
		} else {
			await this.sendNotification('Search rate on match failed');
		}
		return false;
	}

	/**
	 * Ставка выбраного коэфициента.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @returns {Promise<boolean>}
	 */
	private async rate(driver: WebDriver) {
		if (await findSelectorCssAndFill(driver, '.coupon__bet-settings .bet_sum_input', rateAmount.bets.toString())) {
			this.logger.debug(`bet_sum_input ${rateAmount.bets}`);
			await findCssAndCall(driver, '.coupon-btn-group .coupon-btn-group__item');
			if (await findSelectorCss(driver, '.swal2-error')) {
				await this.sendNotification('Bet error');
				// FIXME придумать как нажимать ок на модалках
				return true;
			} else if (await findSelectorCss(driver, '.swal2-warning')) {
				await this.sendNotification('Bet warning');
				// FIXME придумать как нажимать ок на модалках
				return true;
			}
			this.logger.debug('Rate successfully');
			return true;
		}
		await this.sendNotification('Rate failed');
		return false;
	}

	/**
	 * Проверка доступности ставки.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @returns {Promise<boolean>}
	 */
	/*private async availability(driver: WebDriver): Promise<boolean> {
		try {
			if (authPhone.status && false) {
				await this.checkPhone(driver);
				await this.closePromo(driver);
			}
			return true;
		} catch (e) {
			return false;
		}
	}*/

	/**
	 * Метод для поиска надоедливого всплывающего окна и закрытие его.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @returns {Promise<boolean>}
	 */
	/*private async closePromo(driver: WebDriver): Promise<boolean> {
		if (await findById(driver, 'promoPoints')) {
			try {
				await findCssAndCall(driver, '.box-modal_close');
				return true;
			} catch (e) {
				await this.sendNotification(`Can't close promo banner: ${JSON.stringify(e)}`);
				return false;
			}
		}
		return false;
	}*/

	/**
	 * Метод для поиска надоедливого всплывающего окна и закрытие его.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @returns {Promise<boolean>}
	 */

	/*private async checkPhone(driver: WebDriver): Promise<boolean> {
		if (await findById(driver, 'app')) {
			try {
				if (await findSelectorCss(driver, '.block-window')) {
					rateStatus.turnOff();
					await screenShot(driver, `${(new Date()).getTime()}.png`, this.nameBot, this.sendPhoto);
					await this.sendNotification(decorateMessageWaitingPhone(this.nameBot));
					await driver.sleep(this.speed.waitingForCode);

					if (authPhone.phone) {
						await findIdAndFill(driver, 'phone_middle', authPhone.phone);
						await findCssAndCall(driver, '.block-window__btn');
						await driver.sleep(this.speed.normal);

						if (await findSelectorCss(driver, '.swal2-error.swal2-animate-error-icon')) {
							await this.sendNotification('Неверный номер телефона');
						} else if (await findSelectorCss(driver, '.swal2-info.swal2-animate-info-icon')) {
							await this.sendNotification('The phone is correct');
							await findCssAndCall(driver, '.swal2-confirm');
							await driver.sleep(this.speed.fast);
							await screenShot(driver, `${(new Date()).getTime()}.png`, this.nameBot, this.sendPhoto);
							await this.sendNotification(decorateMessageWaitingCode(this.nameBot));
							await driver.sleep(this.speed.waitingForCode);

							if (authPhone.code) {
								await findIdAndFill(driver, 'input_otp', authPhone.code);
								await findCssAndCall(driver, '.block-window__btn');
								await driver.sleep(this.speed.normal);
								await screenShot(driver, `${(new Date()).getTime()}.png`, this.nameBot, this.sendPhoto);

								if (!(await findSelectorCss(driver, '.swal2-error.swal2-animate-error-icon'))) {
									await this.sendNotification('checkPhone successfully');
									rateStatus.turnOn();
									return true;
								}
							}
						}
					}
					await this.sendNotification(decorateMessageVerification());
				}
				return false;
			} catch (e) {
				await this.sendNotification(`Can't close check phone: ${JSON.stringify(e)}`);
				return false;
			}
		}
		return false;
	}*/

	/**
	 * Метод для логирования обработанных ошибок в чат и лог файл.
	 *
	 * @param {String} text текст ошибки
	 */
	private async sendNotification(text: string): Promise<void> {
		this.logger.debug(text);
		await this.telegramService.sendMessageSupport(`<pre>${text}</pre>`);
	}

	/**
	 * Метод для отправки скриншотов в чат support из телеграмм бота..
	 *
	 * @param {ReadStream} file для отправки в чат
	 * @param {String} title Заголовок для фотки
	 */
	private async sendPhoto(file: string, title: string): Promise<void> {
		this.logger.debug(title);
		await this.telegramService.sendPhoto(file, title);
	}

	/**
	 * Метод для проверки что страница загрузилась
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @returns {Promise<boolean>}
	 */
	private async waitLoadPage(driver: WebDriver): Promise<boolean> {
		try {
			await driver.sleep(this.speed.normal);
			return await driver.wait(
				() => driver.executeScript('return document.readyState')
					.then((readyState) => {
						return readyState === 'complete';
					}),
				this.speed.verySlow
			);
		} catch (e) {
			this.logger.error('Error document.readyState -> ' + e);
			return false;
		}
	}
}
