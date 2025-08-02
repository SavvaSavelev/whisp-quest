// src/lib/soundEffects.ts

class SoundManager {
  private context: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private enabled = true;

  constructor() {
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Создаём синтетические звуки для духов
  private createSpiritTone(frequency: number, duration: number, type: 'sine' | 'mystical' = 'sine'): Promise<AudioBuffer> {
    return new Promise((resolve) => {
      if (!this.context) {
        resolve(new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 }));
        return;
      }

      const buffer = this.context.createBuffer(1, this.context.sampleRate * duration, this.context.sampleRate);
      const channelData = buffer.getChannelData(0);

      for (let i = 0; i < channelData.length; i++) {
        const time = i / this.context.sampleRate;
        const fadeOut = Math.max(0, 1 - time / duration);
        
        if (type === 'mystical') {
          // Мистический звук - смесь нескольких частот
          channelData[i] = fadeOut * (
            Math.sin(2 * Math.PI * frequency * time) * 0.3 +
            Math.sin(2 * Math.PI * frequency * 1.5 * time) * 0.2 +
            Math.sin(2 * Math.PI * frequency * 0.5 * time) * 0.1
          );
        } else {
          channelData[i] = fadeOut * Math.sin(2 * Math.PI * frequency * time);
        }
      }

      resolve(buffer);
    });
  }

  async playSound(soundId: string): Promise<void> {
    if (!this.enabled || !this.context) return;

    try {
      let buffer = this.sounds.get(soundId);
      
      if (!buffer) {
        // Создаём звуки для разных действий
        switch (soundId) {
          case 'spirit-message':
            buffer = await this.createSpiritTone(400, 0.8, 'mystical');
            break;
          case 'user-message':
            buffer = await this.createSpiritTone(600, 0.3);
            break;
          case 'spirit-appear':
            buffer = await this.createSpiritTone(800, 1.2, 'mystical');
            break;
          case 'spirit-typing':
            buffer = await this.createSpiritTone(300, 0.1);
            break;
          case 'modal-open':
            buffer = await this.createSpiritTone(500, 0.5);
            break;
          case 'modal-close':
            buffer = await this.createSpiritTone(300, 0.3);
            break;
          default:
            return;
        }
        
        this.sounds.set(soundId, buffer);
      }

      const source = this.context.createBufferSource();
      const gainNode = this.context.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.context.destination);
      
      // Регулируем громкость
      gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
      
      source.start();
    } catch (error) {
      console.warn('Не удалось воспроизвести звук:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Проигрываем звук с задержкой для эффекта печатания
  async playTypingSound(delay: number = 100): Promise<void> {
    if (!this.enabled) return;
    
    for (let i = 0; i < 3; i++) {
      setTimeout(() => this.playSound('spirit-typing'), i * delay);
    }
  }
}

export const soundManager = new SoundManager();
