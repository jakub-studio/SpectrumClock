/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback, useDebugValue, useEffect, useReducer, useRef, useState, Reducer } from "react";
import create, { GetState, SetState, State } from "zustand";
import { getGradientString } from "../lib/gradients";
import { GroupNames, groupsApi, cloneDate } from "../lib/time";

interface TimeState extends State {
	__paused: boolean;
	paused: boolean;
	date: Date;
	currentGroup: GroupNames | null;
	interval?: number;
}

export type RotationMarkers = [string | number, string | number];

export const useSharedTimeState = create<TimeState>((set, get) => {
	const STATE_REFRESH_RATE = 100;

	const setupInterval = (): number => {
		return setInterval((set: SetState<TimeState>, get: GetState<TimeState>) => {
			const state = get();
			const newDate = cloneDate(state.date);
			newDate.setMilliseconds(newDate.getMilliseconds() + STATE_REFRESH_RATE)
			set({ date: newDate });
		}, STATE_REFRESH_RATE, set, get) as unknown as number;
	}

	const initialState: TimeState = {
		__paused: false,
		date: new Date(),
		currentGroup: null,
		get paused () {
			return get().__paused;
		},
		set paused (value) {
			if (value) {
				/* True / Pausing */
				const state = get();
				clearInterval(state.interval);
				set({ __paused: value, interval: void 0 });
			} else {
				/* False / Unpausing */
				const interval = setupInterval();
				set({ __paused: value, interval});
			}
		}
	};

	if (!initialState.__paused) {
		/* Call the set paused() {} function to init interval */
		initialState.paused = false;
	}

	return initialState;
});

console.log(useSharedTimeState);

export const useRing = (group: GroupNames) => {
	useDebugValue(group);
	const ref = useRef<HTMLDivElement | null>(null);
	const animationRef = useRef<Animation | null>(null);
	const timeApi = groupsApi[group];
	const [hovered, setHovered] = useState(false);
	const [markers, setMarkers] = useReducer((markers: RotationMarkers, date: Date) => {
		return timeApi.getRotationMarkers(date)
	}, ["",""]);


	const animate: () => void = useCallback(() => {
		if (!ref.current) return;
		const { date } = useSharedTimeState.getState();
		const { current: el } = ref;

		const animation = animationRef.current = el.animate([
			{ transform: "rotate(0deg)" },
			{ transform: "rotate(360deg)" }
		], {
			duration: timeApi.getDurationUntilNext(date),
			iterations: 1,
			easing: "linear"
		});

		animation.addEventListener("finish", onTick);
		//@ts-ignore
	}, [timeApi]);

	const applyStyles = useCallback(() => {
		if (!ref.current) return;
		const { date } = useSharedTimeState.getState();
		const { current: el } = ref;
		console.log("apply styles called")

		el.style.background = getGradientString(timeApi.split(date));
		const rotation = timeApi.getProgress(date) * 3.6
		el.style.transform = `rotate(${rotation}deg)`;
		return rotation;
	}, [timeApi]);

	const onTick = useCallback(() => {
		useSharedTimeState.setState({date: new Date()})
		animate();
	}, [animate])

	// Init Ring Effect
	useEffect(() => {
		if (!ref.current) return;
		const { date } = useSharedTimeState.getState();

		const { current: el } = ref;

		const rotation = applyStyles();

		const onMouseOver = () => setHovered(true);
		el.addEventListener("mouseover", onMouseOver);
		const onMouseOut = () => setHovered(false);
		el.addEventListener("mouseout", onMouseOut);

		const animation = animationRef.current = el.animate([
			{ transform: `rotate(${rotation}deg)` },
			{ transform: "rotate(360deg)" }
		], {
			duration: timeApi.getDurationUntilNext(date),
			iterations: 1,
			easing: "linear"
		});

		animation.addEventListener("finish", applyStyles);
		animation.addEventListener("finish", onTick);

		return () => {
			el.removeEventListener("mouseover", onMouseOver);
			el.removeEventListener("mouseout", onMouseOut);
		}

	}, [applyStyles, onTick, timeApi]);

	return {
		ref,
		hovered,
		rotationMarkers: markers
	}
}