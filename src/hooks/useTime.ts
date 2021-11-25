/* eslint-disable @typescript-eslint/no-use-before-define */
import { useCallback, useEffect, useReducer, useRef } from "react";
import create, { GetState, SetState, State } from "zustand";
import { getGradientString } from "../lib/gradients";
import { date, paused } from "../lib/params";
import { GroupNames, groupsApi, cloneDate } from "../lib/time";

export interface TimeState extends State {
	readonly paused: boolean;
	pause(): void;
	unpause(): void;
	date: Date;
	currentGroup: GroupNames | null;
	interval?: number;
	resetInterval(): void;
	readonly refreshRate: number;
}

export type RotationMarkers = [string | number, string | number];

const STATE_REFRESH_RATE = 100;
export const useSharedTimeState = create<TimeState>((set, get) => {
	const setupInterval = (): number => {
		return setInterval((set: SetState<TimeState>, get: GetState<TimeState>) => {
			const state = get();
			const newDate = cloneDate(state.date);
			newDate.setMilliseconds(newDate.getMilliseconds() + STATE_REFRESH_RATE)
			set({ date: newDate });
		}, STATE_REFRESH_RATE, set, get) as unknown as number;
	}

	const initialState: TimeState = {
		paused,
		date: date ? new Date(date) : new Date(),
		currentGroup: null,
		interval: paused ? void 0 : setupInterval(),
		refreshRate: STATE_REFRESH_RATE,
		pause() {
			const state = get();
			clearInterval(state.interval);
			set({ paused: true, interval: void 0 });
		},
		unpause() {
			const interval = setupInterval();
			set({ paused: false, interval });
		},
		resetInterval () {
			const state = get();
			clearInterval(state.interval);
			const newInterval = setupInterval();
			set({ interval: newInterval});
		}
	};

	return initialState;
});

console.log(useSharedTimeState);

export const useRing = (group: GroupNames) => {
	const innerRef = useRef<HTMLDivElement | null>(null);
	const outerRef = useRef<HTMLDivElement | null>(null);
	const animationRef = useRef<Animation | null>(null);
	const timeApi = groupsApi[group];

	const [hovered, setHovered] = useReducer((previousState: boolean, hovered: boolean) => {
		if (!outerRef.current) return hovered;
		const { current: el } = outerRef;
		if (hovered) {
			el.style.transform = "scale(1.05)";
			useSharedTimeState.setState({currentGroup: group});
		} else {
			el.style.transform = "scale(1.0)";
			useSharedTimeState.setState({currentGroup: null});
		}
		return hovered;
	}, false);

	const [markers, setMarkers] = useReducer((markers: RotationMarkers, date: Date) => {
		return timeApi.getRotationMarkers(date)
	}, ["", ""]);


	const animate: () => void = useCallback(() => {
		if (!innerRef.current) return;
		useSharedTimeState.setState({ date: new Date() })
		const { date } = useSharedTimeState.getState();
		const { current: el } = innerRef;

		const durationUntilNext = timeApi.getDurationUntilNext(date);
		const animationFinishDate = cloneDate(date)
		animationFinishDate.setMilliseconds(date.getMilliseconds() + durationUntilNext)

		const animation = animationRef.current = el.animate([
			{
				transform: "rotate(0deg)",
				background: getGradientString(timeApi.split(date))
			},
			{
				transform: "rotate(360deg)",
				background: getGradientString(timeApi.split(animationFinishDate))
			}
		], {
			duration: durationUntilNext,
			iterations: 1,
			easing: "linear"
		});

		animation.addEventListener("finish", animate);
		//@ts-ignore
	}, [timeApi]);

	const applyStyles = useCallback(() => {
		if (!innerRef.current) return;
		const { date } = useSharedTimeState.getState();
		const { current: el } = innerRef;

		el.style.background = getGradientString(timeApi.split(date));
		const rotation = timeApi.getProgress(date) * 3.6
		el.style.transform = `rotate(${rotation}deg)`;
		return rotation;
	}, [timeApi]);

	// Init Ring Effect
	useEffect(() => {
		if (!innerRef.current) return;
		const { date, paused } = useSharedTimeState.getState();
		setMarkers(date);

		const { current: el } = innerRef;
		const rotation = applyStyles();

		const onMouseOver = () => setHovered(true);
		el.addEventListener("mouseover", onMouseOver);
		const onMouseOut = () => setHovered(false);
		el.addEventListener("mouseout", onMouseOut);

		if (!paused) {
			const animation = animationRef.current = el.animate([
				{ transform: `rotate(${rotation}deg)` },
				{ transform: "rotate(360deg)" }
			], {
				duration: timeApi.getDurationUntilNext(date),
				iterations: 1,
				easing: "linear"
			});

			animation.addEventListener("finish", animate);
		}

		return () => {
			el.removeEventListener("mouseover", onMouseOver);
			el.removeEventListener("mouseout", onMouseOut);
		}

	}, [animate, applyStyles, timeApi]);

	// Pause Effect
	const paused = useSharedTimeState(state => state.paused);
	useEffect(() => {
		if (!animationRef.current) return;
		if (paused) {
			animationRef.current.pause();
		} else {
			animationRef.current.play();
		}
		
	}, [paused]);

	return {
		innerRef,
		outerRef,
		hovered,
		rotationMarkers: markers
	}
}