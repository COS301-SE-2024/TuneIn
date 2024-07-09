import { useState, useEffect, useRef } from "react";
import { useSpotifyPlayback } from "../hooks/useSpotifyPlayback";
import { Track } from "../models/Track"; // Define Track type if not already defined

class PlaybackManager {
	private queue: Track[] = [];
	private currentTrackIndex: number = 0;
	private isPlaying: boolean = false;
	private secondsPlayed: number = 0;
	private trackPositionIntervalRef: any = null;
	private handlePlayback: any = useSpotifyPlayback();

	setQueue(queue: Track[]) {
		this.queue = queue;
	}

	getQueue() {
		return this.queue;
	}

	getCurrentTrackIndex() {
		return this.currentTrackIndex;
	}

	getIsPlaying() {
		return this.isPlaying;
	}

	getSecondsPlayed() {
		return this.secondsPlayed;
	}

	playPauseTrack(track: Track, index: number) {
		if (!track) {
			console.error("Invalid track:", track);
			return;
		}

		if (index === this.currentTrackIndex && this.isPlaying) {
			this.handlePlayback("pause");
			this.isPlaying = false;
		} else {
			const offset = this.secondsPlayed > 0 ? this.secondsPlayed * 1000 : 0;
			this.handlePlayback("play", track.uri, offset).then(() => {
				this.currentTrackIndex = index;
				this.isPlaying = true;
			});
		}
	}

	playNextTrack() {
		const nextIndex = this.currentTrackIndex + 1;
		if (nextIndex < this.queue.length) {
			const nextTrack = this.queue[nextIndex];
			this.playPauseTrack(nextTrack, nextIndex);
		}
	}

	playPreviousTrack() {
		const previousIndex = this.currentTrackIndex - 1;
		if (previousIndex >= 0) {
			const previousTrack = this.queue[previousIndex];
			this.playPauseTrack(previousTrack, previousIndex);
		}
	}

	startTrackingPosition() {
		if (this.isPlaying) {
			this.trackPositionIntervalRef = setInterval(() => {
				this.secondsPlayed += 1;
			}, 1000);
		} else {
			clearInterval(this.trackPositionIntervalRef);
		}
	}

	stopTrackingPosition() {
		clearInterval(this.trackPositionIntervalRef);
	}
}

export default PlaybackManager;
