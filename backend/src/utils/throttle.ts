/**
 *
 * @param {Function} func функция которую нужно притормозить
 * @param {Number} ms пауза в миллисекундах
 */
export function throttle(func: any, ms: number) {
	let timer: NodeJS.Timeout;
	let resolves: any[] = [];

	return (...args: any[]) => {
		// Run the function after a certain amount of time
		clearTimeout(timer);
		timer = setTimeout(() => {
			// Get the result of the inner function, then apply it to the resolve function of
			// each promise that has been created since the last time the inner function was run
			const result = func(...args);
			resolves.forEach(r => r(result));
			resolves = [];
		}, ms);

		return new Promise(r => resolves.push(r));
	};
}