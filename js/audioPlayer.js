// Audio player controller for theme music playback

class AudioPlayerController {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.hasUserInteracted = false;
    this.currentAudioFile = null;

    // DOM elements (initialized in init())
    this.playPauseBtn = null;
    this.playIcon = null;
    this.pauseIcon = null;
    this.trackSong = null;
    this.trackArtist = null;
    this.progressBar = null;
    this.spotifyLink = null;
    this.playerContainer = null;
  }

  init() {
    this.audio = document.getElementById('audio-element');
    this.playPauseBtn = document.getElementById('play-pause-btn');
    this.playIcon = document.getElementById('play-icon');
    this.pauseIcon = document.getElementById('pause-icon');
    this.trackSong = document.getElementById('track-song');
    this.trackArtist = document.getElementById('track-artist');
    this.progressBar = document.getElementById('progress-bar');
    this.spotifyLink = document.getElementById('spotify-link');
    this.playerContainer = document.getElementById('audio-player');

    // Enable looping
    this.audio.loop = true;

    this.setupEventListeners();
    this.trackUserInteraction();
  }

  setupEventListeners() {
    // Play/Pause button
    this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());

    // Audio events
    this.audio.addEventListener('timeupdate', () => this.updateProgress());
    this.audio.addEventListener('play', () => this.updatePlayState(true));
    this.audio.addEventListener('pause', () => this.updatePlayState(false));
    this.audio.addEventListener('error', (e) => this.handleError(e));
  }

  trackUserInteraction() {
    // Track first user interaction for autoplay policy
    const markInteracted = () => {
      this.hasUserInteracted = true;
      document.removeEventListener('click', markInteracted);
      document.removeEventListener('keydown', markInteracted);
    };
    document.addEventListener('click', markInteracted);
    document.addEventListener('keydown', markInteracted);
  }

  async loadTrack(paletteInfo) {
    const { song, artist, url, audioFile } = paletteInfo;

    // Update track info display
    this.trackSong.textContent = song;
    this.trackArtist.textContent = artist;
    this.spotifyLink.href = url;

    // Reset progress
    this.progressBar.style.width = '0%';

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
      try {
        await this.audio.play();
      } catch (err) {
        console.log('Autoplay prevented:', err.message);
        // User will need to click play manually
      }
    }
  }

  togglePlayPause() {
    if (!this.currentAudioFile) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(err => {
        console.log('Play failed:', err.message);
      });
    }
  }

  updatePlayState(playing) {
    this.isPlaying = playing;
    this.playIcon.style.display = playing ? 'none' : 'block';
    this.pauseIcon.style.display = playing ? 'block' : 'none';
  }

  updateProgress() {
    if (this.audio.duration) {
      const percent = (this.audio.currentTime / this.audio.duration) * 100;
      this.progressBar.style.width = `${percent}%`;
    }
  }

  handleError(e) {
    console.error('Audio error:', e);
    this.playerContainer.classList.add('no-audio');
  }
}

export const audioPlayer = new AudioPlayerController();
