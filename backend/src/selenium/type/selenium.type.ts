export type Speed = {
	veryFast: number;
	fast: number;
	normal: number;
	slow: number;
	verySlow: number;
	waitingForCode: number;
};

export type Auth = {
	login: string;
	password: string;
};

export type LayOrBack = 'lay' | 'back';