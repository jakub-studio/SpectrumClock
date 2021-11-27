<hr/>
<p align="center">
	<b>🧑‍🏫 University Project</b> <br/>
	This repository is for an educational project and is not intended for professional use. Pull Requests, Issues and alike will not be accepted / considered. If you wish to do something with this code, please consider <a href="https://docs.github.com/en/get-started/quickstart/fork-a-repo">forking it</a>.
</p>
<hr/>
<br/>

# The Spectrum Clock
<img width="343" alt="The Spectrum Clock screenshot" src="https://user-images.githubusercontent.com/34782021/143719715-37b9f22a-d39a-4f10-a228-85ad0318a4e3.png">

## What is this?
A clock that tells time using colour and rotations. Please note that it will not be finished and bugs will remain due to [technical limitations](https://github.com/jakuski/SpectrumClock/blob/master/README.md#the-spectrum-clock) that I did not find out about until later in the project.

## How?
<p align="center"><img width="794" alt="Colours with their assigned numbers" src="https://user-images.githubusercontent.com/34782021/143721695-5957460d-560f-47fa-b73e-19b7ee0da58e.png"></p>
I used the HSL system to assign a colour to represent the numbers 0-9. I incremented the hue variable in HSL (<code>hsl(xxx, 100, 50)</code>) in steps of 33°.

Each ring going inwards represents a smaller group of time. The outermost ring shows the current year progression (e.g. if we were around June 20 [halfway through the year], the ring would be pointing downwards (180°) to showcase that the year is halfway complete (like the hands of traditional analog clocks). Going inward the rings are `year`, `month`, `date`, `hour`, `minute`, and `second`.

## Technical Difficulties
Unfortunately I did not do sufficent research before setting out for this project. My intent was that the gradients / rings of the clock would animate into the next gradients. However, current CSS technologies do nut support background-image / gradient transitions and simply snap to the next specified gradient instead of fading the two. There are [workarounds](https://keithjgrant.com/posts/2017/07/transitioning-gradients/) but ultimately I decided to put a pause on the project due to it taking up too much off my time.

## Techologies used
- React
- Create-React-App
- Stitches/React
