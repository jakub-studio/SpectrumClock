import { RotationMarkers } from "../hooks/useTime";

export const splitNum = (num: number, minPoints?: number): number[] => {
	const string = num.toString();
	const final = [];

	for (const char of string) {
		final.push(parseInt(char, 10));
	}

	if (minPoints && (final.length < minPoints)) {
		const zerosToAdd = minPoints - final.length;
		for (let i = 0; i < zerosToAdd; i++) {
			final.unshift(0);
		}
	}

	return final;
}

export const padNum = (num: number, minLength: number): string => {
	return splitNum(num, minLength).join("")
}

export const getDataPointsFromDate = (date: Date) => {
	return {
		year: splitNum(date.getFullYear()),
		month: splitNum(date.getMonth() + 1, 2),
		date: splitNum(date.getDate(), 2),
		hour: splitNum(date.getHours(), 2),
		minute: splitNum(date.getMinutes(), 2),
		second: splitNum(date.getSeconds(), 2)
	};
}

export type GroupNames =  "year" | "month" | "date" | "hour" | "minute" | "second"

const isLeapYear = function(date: Date) {
    var year = date.getFullYear();
    if((year & 3) !== 0) return false;
    return ((year % 100) !== 0 || (year % 400) === 0);
};

const getDayOfYear = function(date: Date) {
	var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	var mn = date.getMonth();
	var dn = date.getDate();
	var dayOfYear = dayCount[mn] + dn;
	if(mn > 1 && isLeapYear(date)) dayOfYear++;
	return dayOfYear;
};

const calcProgress = (count: number, total: number): number => {
	return count / total * 100;
}

const calcRotationMarkers = (value: number, splitPoints?: number | false, overflowBegins?: number, overflowValue?: number): [string | number, string | number] => {
	if (!splitPoints) {
		return [value, value + 1]
	} else {
		let nextValue = value + 1;
		if ((overflowBegins && overflowValue !== undefined) && (nextValue >= overflowBegins)) {
			nextValue = overflowValue;
		}
		return [
			splitNum(value, splitPoints).join(""),
			splitNum(nextValue, splitPoints).join("")
		]
	}
}

export const cloneDate = (date: Date): Date => {
	return new Date(date.valueOf());
}

export const groupsApi: Record<GroupNames, {
	getRotationMarkers: (date: Date) => RotationMarkers,
	getProgress: (date: Date) => number;
	split: (date: Date) => number[];
	getDurationUntilNext: (date: Date) => number;
}> = {
	year: {
		getRotationMarkers (date) {
			return calcRotationMarkers(date.getFullYear())
		},
		getProgress (date) {
			const progress = getDayOfYear(date);
			const yearDuration = isLeapYear(date) ? 366 : 365;
			return calcProgress(progress, yearDuration);
		},
		split (date) {
			return splitNum(date.getFullYear())
		},
		getDurationUntilNext (date) {
			const clone = cloneDate(date);
			clone.setFullYear(date.getFullYear() + 1, 0, 1);
			clone.setHours(0, 0, 0, 0);
			return clone.getTime() - date.getTime();
		}
	},
	month: {
		getRotationMarkers (date) {
			const dateClone = cloneDate(date);
			dateClone.setMonth(date.getMonth() + 1);
			return [
				date.toLocaleDateString("en-GB", {month: "short"}),
				dateClone.toLocaleDateString("en-GB", {month: "short"})
			]
		},
		getProgress (date) {
			const currentDate = date.getDate();
			const dateClone = cloneDate(date);
			
			// Get first day of next month
			dateClone.setMonth(date.getMonth() + 1)
			dateClone.setDate(0);
			const lastDayOfMonth = dateClone.getDate();
			return calcProgress(currentDate, lastDayOfMonth + 1);
		},
		split (date) {
			return splitNum(date.getMonth() + 1, 2)
		},
		getDurationUntilNext (date) {
			const dateClone = cloneDate(date);
			
			// Get first day of next month
			dateClone.setMonth(date.getMonth() + 1, 1);
			dateClone.setHours(0, 0, 0, 0);
			
			return dateClone.getTime() - date.getTime()
		}
	},
	date: {
		getRotationMarkers (date) {
			const currentDate = date.getDate();
			const dateClone = cloneDate(date);
			dateClone.setDate(currentDate + 1);
			return [
				splitNum(currentDate, 2).join(""),
				splitNum(dateClone.getDate(), 2).join("")
			]
		},
		getProgress (date) {
			return calcProgress(date.getHours(), 24);
		},
		split (date) {
			return splitNum(date.getDate(), 2)
		},
		getDurationUntilNext (date) {
			const dateClone = cloneDate(date);
			
			dateClone.setDate(date.getDate() + 1);
			dateClone.setHours(0, 0, 0, 0);
			
			return dateClone.getTime() - date.getTime()
		}
	},
	hour: {
		getRotationMarkers (date) {
			return calcRotationMarkers(date.getHours(), 2, 24, 0)
		},
		getProgress (date) {
			return calcProgress(date.getMinutes(), 60);
		},
		split (date) {
			return splitNum(date.getHours(), 2);
		},
		getDurationUntilNext (date) {
			const dateClone = cloneDate(date);
			dateClone.setHours(date.getHours() + 1, 0,0,0);
			return dateClone.getTime() - date.getTime()
		}
	},
	minute: {
		getRotationMarkers (date) {
			return calcRotationMarkers(date.getMinutes(), 2, 60, 0)
		},
		getProgress (date) {
			return calcProgress(date.getSeconds(), 60);
		},
		split (date) {
			return splitNum(date.getMinutes(), 2);
		},
		getDurationUntilNext (date) {
			const dateClone = cloneDate(date);
			dateClone.setMinutes(date.getMinutes() + 1, 0,0);
			return dateClone.getTime() - date.getTime()
		}
	},
	second: {
		getRotationMarkers (date) {
			return calcRotationMarkers(date.getSeconds(), 2, 60, 0)
		},
		getProgress (date) {
			return calcProgress(date.getMilliseconds(), 999);
		},
		split (date) {
			return splitNum(date.getSeconds(), 2);
		},
		getDurationUntilNext (date) {
			const dateClone = cloneDate(date);
			dateClone.setSeconds(date.getSeconds() + 1, 0);
			return dateClone.getTime() - date.getTime()
		}
	}
}

//@ts-ignore
window.timeApi = groupsApi;
