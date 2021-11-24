import { HSLArray, getHSLString, stepsColours } from "./colours";

type GradientStep = [HSLArray, number];

export const getGradientString = (colours: number[]): string => {
	let gradientSteps: GradientStep[] = [];
	const { length } = colours;
	const stops = 360 / colours.length;
	const stopsHalf = stops / 2;

	if (length === 1) {
		gradientSteps.push([stepsColours[0], 0]);
		gradientSteps.push([stepsColours[colours[0]], 360]);
	} else {
		let currentDegree = 0 - stopsHalf;

		gradientSteps.push([
			stepsColours[colours[colours.length - 1]],
			currentDegree
		]);
		currentDegree = currentDegree + stops;

		colours.forEach((colour) => {
			gradientSteps.push([stepsColours[colour], currentDegree]);
			currentDegree = currentDegree + stops;
		});

		gradientSteps.push([stepsColours[colours[0]], currentDegree]);
	}

	const mappedSteps = gradientSteps.map(
		(step) => `${getHSLString(step[0])} ${step[1]}deg`
	);

	return `conic-gradient(from 0deg at 50% 50%, ${mappedSteps.join(", ")})`;
};

export const getPercentageBasedGradientString = (colours: number[]): string => {
	let gradientSteps: GradientStep[] = [];
	const { length } = colours;
	const stops = 360 / colours.length;
	const stopsHalf = stops / 2;

	if (length === 1) {
		gradientSteps.push([stepsColours[0], 0]);
		gradientSteps.push([stepsColours[colours[0]], 360]);
	} else {
		let currentDegree = 0 - stopsHalf;

		gradientSteps.push([
			stepsColours[colours[colours.length - 1]],
			currentDegree
		]);
		currentDegree = currentDegree + stops;

		colours.forEach((colour) => {
			gradientSteps.push([stepsColours[colour], currentDegree]);
			currentDegree = currentDegree + stops;
		});

		gradientSteps.push([stepsColours[colours[0]], currentDegree]);
	}

	const mappedSteps = gradientSteps.map(
		(step) => `${getHSLString(step[0])} ${step[1]}deg`
	);

	return `conic-gradient(from 0deg at 50% 50%, ${mappedSteps.join(", ")})`;
};