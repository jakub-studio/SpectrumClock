export const params = new URLSearchParams(window.location.search);
export const Parameter = <T extends unknown>(name: string, format?: (value: string | null) => T): T => {
	const paramValue = params.get(name);
	let returnValue = paramValue as unknown;

	if (typeof format === "function") {
		returnValue = format(paramValue);
	}

	return returnValue as T;
}

export enum ParamNames {
	DATE = "d",
	PAUSED = "p"
}

export const date = Parameter(ParamNames.DATE, date => {
	return date ? new Date(date) : null
});

export const paused = Parameter(ParamNames.PAUSED, Boolean);