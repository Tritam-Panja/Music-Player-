import { playerService } from '../core/player/PlayerService';

/**
 * AudioEngine Facade
 * Bridges legacy audioEngine imports directly to core PlayerService.
 */
class AudioEngineFacade {
  get currentTrack() {
    return playerService.currentTrack;
  }

  get isPlaying() {
    return playerService.isPlaying;
  }

  get currentTime() {
    return playerService.currentTime;
  }

  get duration() {
    return playerService.duration;
  }

  get volume() {
    return playerService.volume;
  }

  get isMuted() {
    return playerService.isMuted;
  }

  playTrack(track) {
    playerService.play(track);
  }

  pause() {
    playerService.pause();
  }

  resume() {
    playerService.resume();
  }

  togglePlay() {
    playerService.togglePlay();
  }

  seek(seconds) {
    playerService.seek(seconds);
  }

  setVolume(vol) {
    playerService.setVolume(vol);
  }

  toggleMute() {
    playerService.toggleMute();
  }

  next() {
    playerService.next();
  }

  previous() {
    playerService.previous();
  }

  subscribe(listener) {
    return playerService.subscribe(listener);
  }

  on(eventName, callback) {
    window.addEventListener(`audio:${eventName}`, callback);
  }

  off(eventName, callback) {
    window.removeEventListener(`audio:${eventName}`, callback);
  }

  emitEvent(eventName, data) {
    window.dispatchEvent(new CustomEvent(`audio:${eventName}`, { detail: data }));
  }
}

export const audioEngine = new AudioEngineFacade();

