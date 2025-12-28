const SOUNDS = {
  NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3', 
  QUEST_CLEAR: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', 
  LEVEL_UP: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', 
  RANK_UP: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', 
  PENALTY: 'https://assets.mixkit.co/active_storage/sfx/951/951-preview.mp3', 
  CLICK: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  ALARM_DEFAULT: 'https://assets.mixkit.co/active_storage/sfx/223/223-preview.mp3' // High frequency beep
};

class AudioService {
  private ctx: AudioContext | null = null;
  private buffers: Record<string, AudioBuffer> = {};
  private enabled: boolean = true;
  private initialized: boolean = false;
  private alarmSource: AudioBufferSourceNode | null = null;
  private userAlarmAudio: string | null = null;

  private async initContext() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const loadPromises = Object.entries(SOUNDS).map(async ([key, url]) => {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        if (this.ctx) {
          this.buffers[key] = await this.ctx.decodeAudioData(arrayBuffer);
        }
      });
      await Promise.all(loadPromises);
      this.initialized = true;
    } catch (e) {
      console.warn("Audio Engine init failed:", e);
    }
  }

  setUserAlarm(audioBase64: string | null) {
    this.userAlarmAudio = audioBase64;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async play(soundKey: keyof typeof SOUNDS) {
    if (!this.enabled) return;
    if (!this.initialized) await this.initContext();
    if (!this.ctx || !this.buffers[soundKey]) return;
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffers[soundKey];
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.4;
    source.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    source.start(0);
  }

  async startAlarm() {
    if (!this.enabled) return;
    if (!this.initialized) await this.initContext();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') await this.ctx.resume();
    this.stopAlarm();

    this.alarmSource = this.ctx.createBufferSource();
    this.alarmSource.buffer = this.buffers['ALARM_DEFAULT'];
    this.alarmSource.loop = true;
    
    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.6;
    this.alarmSource.connect(gainNode);
    gainNode.connect(this.ctx.destination);
    this.alarmSource.start(0);
  }

  stopAlarm() {
    if (this.alarmSource) {
      try {
        this.alarmSource.stop();
      } catch (e) {}
      this.alarmSource = null;
    }
  }
}

export const audioService = new AudioService();