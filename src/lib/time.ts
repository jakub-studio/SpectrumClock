const splitNum = (num: number, minPoints?: number): number[] => {
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