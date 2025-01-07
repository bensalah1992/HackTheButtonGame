import { Howl, Howler } from 'howler';

// Audio file formats supported: MP3, WebM, and WAV
// Place music files in: client/public/audio/
// Recommended format: MP3 for best compatibility and file size
const AUDIO_PATHS = {
  standard: '/audio/standard.mp3',
  hardmode: '/audio/hardmode.mp3'
};

// Sound effects (base64 encoded for better loading)
const CLICK_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrY2NjY2Nj///////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAABVjMmLsL';
const ERROR_SOUND = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAEAAABVgANTU1NTU1Q0NDQ0NDUFBQUFBQXl5eXl5ea2tra2tra3l5eXl5eYaGhoaGhpSUlJSUlKGhoaGhoaGvr6+vr6+8vLy8vLzKysrKysrY2NjY2Nj///////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAABVjMmLsL';

class AudioManager {
  private clickSound: Howl;
  private errorSound: Howl;
  private music: Record<string, Howl>;
  private currentTrack: string | null = null;
  private isInitialized: boolean = false;

  constructor() {
    console.log('Initializing AudioManager...');

    // Configure Howler global settings
    Howler.autoUnlock = true;
    Howler.autoSuspend = false;
    Howler.html5PoolSize = 10;

    this.clickSound = new Howl({
      src: [CLICK_SOUND],
      volume: 0.7,
      preload: true,
      html5: true
    });

    this.errorSound = new Howl({
      src: [ERROR_SOUND],
      volume: 0.6,
      preload: true,
      html5: true
    });

    // Initialize music tracks
    this.music = {};
    Object.entries(AUDIO_PATHS).forEach(([key, path]) => {
      console.log(`Loading music track: ${key} from path: ${path}`);
      this.music[key] = new Howl({
        src: [path],
        volume: 0.4,
        loop: true,
        preload: true,
        html5: false, // Use Web Audio API for better performance
        onload: () => {
          console.log(`Successfully loaded ${key} track`);
          // Start playing standard track immediately if it's loaded
          if (key === 'standard' && !this.currentTrack) {
            this.playMusic('standard');
          }
        },
        onloaderror: (id, error) => {
          console.error(`Failed to load ${key} track:`, error);
        },
        onplayerror: (id, error) => {
          console.error(`Error playing ${key} track:`, error);
          // Attempt to recover from play error
          if (this.isInitialized) {
            console.log('Attempting to recover from play error...');
            const track = this.music[key];
            if (track) {
              track.once('unlock', () => {
                track.play();
              });
            }
          }
        }
      });
    });

    // Initialize immediately
    this.init();
  }

  init() {
    if (!this.isInitialized) {
      console.log('Initializing audio context...');

      // Force Web Audio API context to initialize
      Howler.volume(1.0);

      const context = Howler.ctx;
      if (context && context.state === 'suspended') {
        context.resume().then(() => {
          console.log('Audio context resumed successfully');
          this.isInitialized = true;
          // Try to play standard track after initialization
          this.playMusic('standard');
        }).catch(err => {
          console.error('Failed to resume audio context:', err);
        });
      } else {
        this.isInitialized = true;
        console.log('Audio context is already active');
        // Try to play standard track after initialization
        this.playMusic('standard');
      }
    }
  }

  playClick() {
    if (this.isInitialized) {
      this.clickSound.play();
    }
  }

  playError() {
    if (this.isInitialized) {
      this.errorSound.play();
    }
  }

  playMusic(track: keyof typeof AUDIO_PATHS) {
    console.log(`Attempting to play ${track} track...`);

    if (!this.isInitialized) {
      console.warn('Attempted to play music before initialization');
      this.init(); // Try to initialize if not already
      return;
    }

    // Stop current track if playing
    if (this.currentTrack) {
      console.log(`Stopping current track: ${this.currentTrack}`);
      this.music[this.currentTrack].stop();
    }

    // Start new track
    const newTrack = this.music[track];
    if (newTrack) {
      console.log(`Starting ${track} track`);
      newTrack.play();
      this.currentTrack = track;
    } else {
      console.error(`Track ${track} not found`);
    }
  }

  stopMusic() {
    if (this.currentTrack) {
      this.music[this.currentTrack].stop();
      this.currentTrack = null;
    }
  }

  // No more intensity-based modifications
  setMusicIntensity() {
    // Removed pitch and speed modifications
  }
}

export const audioManager = new AudioManager();