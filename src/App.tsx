import './App.css';
import { styled } from '@stitches/react';
import { GroupNames, padNum } from './lib/time';
import React, { memo, useCallback, useRef } from 'react';
import { TimeState, useRing, useSharedTimeState } from './hooks/useTime';
import { date, ParamNames, params } from './lib/params';
import shallow from "zustand/shallow";

const groups: GroupNames[] = ["year", "month", "date", "hour", "minute", "second"];

const RING_BASE_SIZE = 250;
const RING_REDUCTION = 40;

const RingContainer = styled("div", {
	marginTop: 10,
	width: "100%",
	height: 400,
	display: "flex",
	justifyContent: "center",
	alignItems: "center"
});

interface RingControllerProps {
	representing: GroupNames;
}

const RingProgressionPointer = styled("div", {
	position: "absolute",
	top: 3,
	width: 4,
	height: 4,
	borderRadius: "100%",
	opacity: 1,
	backgroundColor: "hsla(0, 0%, 0%, 0.75)",
	transition: "top 0.175s ease",
});

const RotationMarkerDivider = styled("div", {
	width: 2,
	height: 10,
	margin: "0 5px"
})

const RotationMarkerContainer = styled("code", {
	variants: {
		show: {
			true: {
				transform: "translate(0px, 0px)",
				opacity: 1
			},
			false: {
				transform: "translate(0px, 20px)",
				opacity: 0
			}
		}
	},
	$$color: "hsla(0, 0%, 0%, 0.35)",
	position: "absolute",
	display: "flex",
	alignItems: "center",
	top: 5,
	color: "$$color",
	fontSize: 14,
	fontWeight: "bold",
	transition: "all 0.175s ease",
	userSelect: "none",
	[`& ${RotationMarkerDivider}`]: {
		backgroundColor: "$$color"
	}
});

const RingOuter = styled("div", {
	position: "absolute",
	aspectRatio: "1/1",
	pointerEvents: "none",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	transition: "transform 0.175s ease",
});

const RingInner = styled("div", {
	width: "100%",
	height: "100%",
	cursor: "grab",
	pointerEvents: "all",
	borderRadius: "100%",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	filter: "drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.3))",
	transition: "transform 0.175s ease",
	"&:active": {
		cursor: "grabbing"
	},
	"&:hover": {
		transform: "scale(1.075)"
	},
	[`&:hover ${RingProgressionPointer}`]: {
		top: 9
	}
})

const RingController = (props: RingControllerProps) => {
	const {
		innerRef,
		outerRef,
		rotationMarkers,
		hovered
	} = useRing(props.representing);
	const width = useRef(RING_BASE_SIZE - (RING_REDUCTION * groups.indexOf(props.representing)));

	return <RingOuter
		data-representing={props.representing}
		data-value={rotationMarkers[0]}
		title={`${props.representing}: ${rotationMarkers[0]}`}
		css={{ width: width.current }}
		ref={outerRef}
	>
		<RingInner ref={innerRef}>
			<RingProgressionPointer />
		</RingInner>

		<RotationMarkerContainer show={hovered}>
			{rotationMarkers[0]}<RotationMarkerDivider />{rotationMarkers[1]}
		</RotationMarkerContainer>
	</RingOuter>
}

const NewRing = () => {
	return <RingContainer css={{ position: "relative" }}>
			<RingController representing="year"/>
			<RingController representing="month"/>
			<RingController representing="date"/>
			<RingController representing="hour"/>
			<RingController representing="minute"/>
			{/* <RingController representing="second"/> */}
	</RingContainer>
}

const TimeGroupContainer = styled("code", { fontSize: "18pt" });

const TimeGroup = memo(styled("span", {
	variants: {
		bold: {
			true: {
				fontWeight: "bold"
			},
			false: {
				fontWeight: "normal"
			}
		}
	}
}), (previousProps, newProps) => {
	if (previousProps.bold !== newProps.bold) {
		return false;
	}
	if (previousProps.children === newProps.children) {
		return true;
	}
	return false;
});

const TimeString = () => {
	const { date, currentGroup } = useSharedTimeState(
		useCallback((state): Pick<TimeState, "date" | "currentGroup"> => ({ date: state.date, currentGroup: state.currentGroup }), []),
		shallow
	);

	let ms = date.getMilliseconds().toString();
	if (ms.length === 2) {
		ms = "0"
	} else {
		ms = ms[0];
	}

	return <TimeGroupContainer>
		<TimeGroup bold={currentGroup === "year"}>{date.getFullYear()}</TimeGroup>/ 
		<TimeGroup bold={currentGroup === "month"}>{padNum(date.getMonth() + 1, 2)}</TimeGroup>/
		<TimeGroup bold={currentGroup === "date"}>{padNum(date.getDate(), 2)}</TimeGroup>{" "}
		<TimeGroup bold={currentGroup === "hour"}>{padNum(date.getHours(), 2)}</TimeGroup>:
		<TimeGroup bold={currentGroup === "minute"}>{padNum(date.getMinutes(), 2)}</TimeGroup>{/* :
		<TimeGroup bold={currentGroup === "second"}>{padNum(date.getSeconds(), 2)}:{ms}</TimeGroup> */}
	</TimeGroupContainer>
}

const StateControllerButtons = () => {
	const state = useSharedTimeState(
		useCallback((state): Pick<TimeState, "pause" | "paused" | "unpause"> => ({paused: state.paused, pause: state.pause, unpause: state.unpause}), []),
		shallow
	);

	const onPause = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		state.pause();
	}, [state]);

	const onPlay = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		state.unpause();
	}, [state]);

	return <div>
		<button disabled={!state.paused} onClick={onPlay}>play</button>
		<button disabled={state.paused} onClick={onPause}>pause</button>
	</div>
}

const ControllerButtons = styled("div", {
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	gap: '8px',
	marginBottom: '8px'
});


function App() {
	return (
		<div className="App">
			<div>
				<ControllerButtons>
					<StateControllerButtons />
				</ControllerButtons>
				<form>
					<input type="datetime-local" name={ParamNames.DATE} defaultValue={date ? params.get(ParamNames.DATE) + "" : void 0} required />
					<input type="hidden" name={ParamNames.PAUSED} value="1" />
					<button type="submit">set</button>
				</form>
			</div>
			<TimeString />
			<NewRing />
		</div>
	);
}

export default App;
