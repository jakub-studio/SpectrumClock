import { useRef } from "react";
import create, { State } from "zustand";

const interalTimeState = create<State>((set, get) => ({

}))

export const useRing = () => {
	const ref = useRef<HTMLDivElement>(null);

	return { ref }
}