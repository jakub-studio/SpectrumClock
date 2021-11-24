export const params = new URLSearchParams(window.location.search);

export enum ParamNames {
	DATE = "d",
	PAUSED = "p"
}

const dateParam = params.get(ParamNames.DATE);
export const date = dateParam ? new Date(dateParam) : null;

const pausedParam = params.get(ParamNames.PAUSED);
export const paused = Boolean(pausedParam);