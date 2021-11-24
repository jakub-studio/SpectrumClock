import logo from './logo.svg';
import './App.css';
import { getGradientString } from './lib/gradients';
import { styled } from '@stitches/react';
import { getDataPointsFromDate, GroupNames, padNum } from './lib/time';
import React, { createContext, MutableRefObject, RefObject, useCallback, useContext, useEffect, useRef } from 'react';
import useInterval from './hooks/useInterval';
import { useRing, useSharedTimeState } from './hooks/useTime';
import { ParamNames } from './lib/params';

const RingContainer = styled("div", {
	marginTop: 10,
	width: "100%",
	height: 400,
	display: "flex",
	justifyContent: "center",
	alignItems: "center"
});

const sizes = {
	large: {
		baseSize: 300,
		reduction: 40
	}
}

const ClockContext = createContext<{ size: keyof typeof sizes }>({
	size: "large"
})



const groups: GroupNames[] = ["year", "month", "date", "hour", "minute", "second"]

interface RingControllerProps {
	representing: GroupNames;
}

const RingProgressionPointer = styled("div", {
	position: "absolute",
	top: 3,
	width: 2,
	height: 10,
	borderRadius: "30%",
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
	const { size } = useContext(ClockContext);
	const {
		ref,
		rotationMarkers,
		hovered
	} = useRing(props.representing);
	const sizeData = sizes[size];
	const width = useRef(sizeData.baseSize - (sizeData.reduction * groups.indexOf(props.representing)));

	return <RingOuter
		data-representing={props.representing}
		data-value={rotationMarkers[0]}
		title={`${props.representing}: ${rotationMarkers[0]}`}
		css={{ width: width.current }}
	>
		<RingInner ref={ref}>
			<RingProgressionPointer />
		</RingInner>

		<RotationMarkerContainer show={hovered}>
			{rotationMarkers[0]}<RotationMarkerDivider />{rotationMarkers[1]}
		</RotationMarkerContainer>
	</RingOuter>
}

const NewRing = () => {
	return <RingContainer css={{ position: "relative" }}>
		<ClockContext.Provider value={{ size: "large" }}>
			<RingController representing="year"/>
			<RingController representing="month"/>
			<RingController representing="date"/>
			<RingController representing="hour"/>
			<RingController representing="minute"/>
			<RingController representing="second"/>
		</ClockContext.Provider>
	</RingContainer>
}

const TimeGroupContainer = styled("code", { fontSize: "18pt" });

const TimeGroup = styled("span", {
	variants: {
		date: {
			true: {
				"&::after": {
					content: "/"
				}
			}
		},
		time: {
			true: {
				"&::after": {
					content: ":"
				}
			}
		},
		bold: {
			true: {
				fontWeight: "bold"
			},
			false: {
				fontWeight: "normal"
			}
		}
	}
});

const TimeString = () => {
	const { date, currentGroup } = useSharedTimeState();

	let ms = date.getMilliseconds().toString();
	if (ms.length === 2) {
		ms = "0"
	} else {
		ms = ms[0];
	}

	return <TimeGroupContainer>
		<TimeGroup date bold={currentGroup === "year"}>{date.getFullYear()}</TimeGroup>
		<TimeGroup date bold={currentGroup === "month"}>{padNum(date.getMonth(), 2)}</TimeGroup>
		<TimeGroup bold={currentGroup === "date"}>{padNum(date.getDate(), 2)}</TimeGroup>{" "}
		<TimeGroup time bold={currentGroup === "hour"}>{padNum(date.getHours(), 2)}</TimeGroup>
		<TimeGroup time bold={currentGroup === "minute"}>{padNum(date.getMinutes(), 2)}</TimeGroup>
		<TimeGroup time bold={currentGroup === "second"}>{padNum(date.getSeconds(), 2)}</TimeGroup>
		<TimeGroup>{ms}</TimeGroup>
	</TimeGroupContainer>
}

const StateControllerButtons = () => {
	const paused = useSharedTimeState(state => state.paused);

	const onPause = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		useSharedTimeState.setState({paused: true});
	}, []);

	const onPlay = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault();
		useSharedTimeState.setState({paused: false});
	}, []);

	return <div>
		<button disabled={!paused} onClick={onPlay}>play</button>
		<button disabled={paused} onClick={onPause}>pause</button>
	</div>
}


function App() {
	return (
		<div className="App">
			<div>
				<StateControllerButtons />
				<form>
					<input type="datetime-local" name={ParamNames.DATE} />
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
