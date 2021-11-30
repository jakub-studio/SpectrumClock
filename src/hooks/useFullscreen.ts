import { useCallback } from 'react'

export const useFullscreen = () => {
	const fullscreened: boolean = document.fullscreenElement !== null;

	const toggle = useCallback(() => {
		if (fullscreened) {
			try {
				document.exitFullscreen();
			} catch {}
		} else {
			// use document.documentElement instead of body due to https://stackoverflow.com/a/24727000
			document.documentElement.requestFullscreen();
		}
	}, [fullscreened]);

	return {
		toggle,
		fullscreened
	}
}