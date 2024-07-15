import React from "react";
import Svg, { Path, Circle } from "react-native-svg";

const SpeakerIcon = () => (
	<Svg data-name="Layer 1" viewBox="0 0 100 125" width={50} height={50}>
		<Path d="M77 70V30a12 12 0 0 0-12-12H35a12 12 0 0 0-12 12v40a12 12 0 0 0 12 12h30a12 12 0 0 0 12-12Zm-46 0V30a4 4 0 0 1 4-4h30a4 4 0 0 1 4 4v40a4 4 0 0 1-4 4H35a4 4 0 0 1-4-4Z" />
		<Path d="M50 45a12 12 0 1 0 12 12 12 12 0 0 0-12-12Zm0 16a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z" />
		<Circle cx={50} cy={36} r={4} />
	</Svg>
);

export default SpeakerIcon;
