export const startingHue = 0;
export const hueRange = 330;
export const getSaturation = (): number => 100;
export const getLightness = (): number => 50;
export type HSLArray = [number, number, number];

export const stepsArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
export type Steps = typeof stepsArray[number];

export const getHSLString = (array: HSLArray): string =>
	`hsla(${array[0]}, ${array[1]}%, ${array[2]}%, 1)`;

export const stepsColours: Record<Steps, HSLArray> = {};

const defineColours = () => {
	const length = stepsArray.length - 1;

	const hueIncrementAmount = hueRange / length;

	for (const step of stepsArray) {
		stepsColours[step] = [
			startingHue + hueIncrementAmount * step,
			getSaturation(),
			getLightness()
		];
	}
};

defineColours();