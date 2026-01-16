// Audio player controller for theme music playback

class AudioPlayerController {
  constructor() {
    this.audio = null;
    this.isMuted = false;
    this.hasUserInteracted = false;
    this.currentAudioFile = null;

    // DOM elements (initialized in init())
    this.muteBtn = null;
    this.unmuteIcon = null;
    this.muteIcon = null;
    this.trackSong = null;
    this.trackArtist = null;
    this.spotifyLink = null;
    this.playerContainer = null;
  }

  init() {
    this.audio = document.getElementById('audio-element');
    this.muteBtn = document.getElementById('mute-btn');
    this.unmuteIcon = document.getElementById('unmute-icon');
    this.muteIcon = document.getElementById('mute-icon');
    this.trackSong = document.getElementById('track-song');
    this.trackArtist = document.getElementById('track-artist');
    this.spotifyLink = document.getElementById('spotify-link');
    this.playerContainer = document.getElementById('audio-player');

    // Enable looping
    this.audio.loop = true;

    // Restore mute state from localStorage
    this.isMuted = localStorage.getItem('audioMuted') === 'true';
    this.audio.muted = this.isMuted;
    this.updateMuteState();

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Mute/Unmute button
    this.muteBtn.addEventListener('click', () => this.toggleMute());

    // Audio events
    this.audio.addEventListener('error', (e) => this.handleError(e));
  }

  start() {
    // Called when user dismisses interstitial
    this.hasUserInteracted = true;
    // iOS Safari requires audio to be "unlocked" during user gesture
    // Calling load() then play() in the same gesture handler ensures this
    this.audio.load();
    this.audio.play().catch(() => {});
  }

  async loadTrack(paletteInfo) {
    const { song, artist, url, audioFile } = paletteInfo;

    // Update track info display
    this.trackSong.textContent = song;
    this.trackArtist.textContent = artist;
    this.spotifyLink.href = url;

    // Handle missing audio file
    if (!audioFile) {
      this.playerContainer.classList.add('no-audio');
      this.audio.src = '';
      this.currentAudioFile = null;
      return;
    }

    this.playerContainer.classList.remove('no-audio');
    this.currentAudioFile = audioFile;

    // Load new audio source
    this.audio.src = audioFile;
    this.audio.load();

    // Attempt autoplay if user has interacted
    if (this.hasUserInteracted) {
      // For iOS: wait for canplay event before attempting play
      const playWhenReady = () => {
        this.audio.play().catch(() => {});
        this.audio.removeEventListener('canplay', playWhenReady);
      };

      if (this.audio.readyState >= 3) {
        // Already ready to play
        this.audio.play().catch((err) => {
          console.log('Autoplay prevented:', err.message);
        });
      } else {
        // Wait for audio to be ready
        this.audio.addEventListener('canplay', playWhenReady);
      }
    }
  }

  toggleMute() {
    if (!this.currentAudioFile) return;

    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    this.updateMuteState();

    // Save preference
    localStorage.setItem('audioMuted', this.isMuted);

    // If unmuting and audio isn't playing, start it
    if (!this.isMuted && this.audio.paused) {
      this.audio.play().catch(() => {});
    }
  }

  updateMuteState() {
    this.unmuteIcon.style.display = this.isMuted ? 'none' : 'block';
    this.muteIcon.style.display = this.isMuted ? 'block' : 'none';
  }

  handleError(e) {
    console.error('Audio error:', e);
    this.playerContainer.classList.add('no-audio');
  }
}

export const audioPlayer = new AudioPlayerController();
