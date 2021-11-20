import logo from './logo.svg';
import './App.css';
import { getGradientString } from './lib/gradients';
import { styled } from '@stitches/react';
import { getDataPointsFromDate } from './lib/time';
import { createContext, MutableRefObject, RefObject, useContext, useRef } from 'react';

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

const RingInner = styled("div", {
	position: "absolute",
	borderRadius: "100%",
	aspectRatio: "1/1",
	cursor: "grab",
	display: "flex",
	justifyContent: "center",
	alignItems: "center",
	filter: "drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.3))",
	"&:active": {
		cursor: "grabbing"
	},
	"&::after": {
		content: "",
		position: "absolute",
		top: 3,
		width: 2,
		height: 10,
		borderRadius: "30%",
		backgroundColor: "hsla(0, 0%, 0%, 0.75)"
	}
});

const groups = ["year", "month", "date", "hour", "minute", "second"]

interface RingControllerProps {
	representing: "year" | "month" | "date" | "hour" | "minute" | "second";
	value: number[];
}

const RingController = (props: RingControllerProps) => {
	const { size } = useContext(ClockContext);
	const ref: RefObject<HTMLDivElement> = useRef<HTMLDivElement | null>(null)
	const sizeData = sizes[size];
	const width = sizeData.baseSize - (sizeData.reduction * groups.indexOf(props.representing));

	return <RingInner
		ref={ref}
		data-representing={props.representing}
		data-value={props.value.join("")}
		style={{
			background: getGradientString(props.value),
			width: width
		}}
	/>
}

const NewRing = () => {
	const data = getDataPointsFromDate(new Date());

	return <RingContainer css={{ position: "relative" }}>
		<ClockContext.Provider value={{ size: "large" }}>
			<RingController representing="year" value={data.year} />
			<RingController representing="month" value={data.month} />
			<RingController representing="date" value={data.date} />
			<RingController representing="hour" value={data.hour} />
			<RingController representing="minute" value={data.minute} />
			<RingController representing="second" value={data.second} />
		</ClockContext.Provider>
	</RingContainer>
}


function App() {
	return (
		<div className="App">
			<NewRing />
		</div>
	);
}

export default App;
