import { setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { SpeechStreamingServiceEvent } from './enums';

const textBreakpoints = ['.', '!', '?', ',', ';', ':', '-'];

class SpeechStreamingService {
  private spokenText: string;
  private listeners: Map<string, Array<(...args: Array<any>) => void>> = new Map();

  constructor() {
    this.spokenText = '';
  }

  public onSpeakingStart(callback: () => void): () => void {
    return this.addEventListener(SpeechStreamingServiceEvent.SPEAKING_START, callback);
  }

  public onSpeakingEnd(callback: () => void): () => void {
    return this.addEventListener(SpeechStreamingServiceEvent.SPEAKING_END, callback);
  }

  public stopContentSpeaking = async (): Promise<void> => {
    await Speech.stop();
    this.spokenText = '';
  };

  public handleContent(text: string, isDone?: boolean): void {
    const unspokenText = text.slice(this.spokenText.length);

    let textToSpeak = '';

    // NOTE: We need to separate text by breakpoints to make it more natural
    for (let i = unspokenText.length - 1; i >= 0; i--) {
      if (textBreakpoints.includes(unspokenText[i])) {
        textToSpeak = unspokenText.slice(0, i + 1);
        break;
      }
    }

    if (textToSpeak.trim()) {
      if (this.spokenText.length === 0) {
        this.emit(SpeechStreamingServiceEvent.SPEAKING_START);
      }

      this.spokenText = this.spokenText + textToSpeak;

      this.speakText(textToSpeak);
    }

    if (isDone) {
      // NOTE: If the text is done, we need to stop speaking and emit the event
      this.speakText('', true);
    }
  }

  public clearListeners(): void {
    this.listeners.clear();
  }

  private speakText = async (text: string, isDone?: boolean): Promise<void> => {
    // NOTE: Need to set audio mode to allow speech in silent mode on iOS
    await setAudioModeAsync({
      playsInSilentMode: true,
    });

    Speech.speak(text, {
      // NOTE: Only English is working good for now
      language: 'en-US',
      onDone: () => {
        if (isDone) {
          this.emit(SpeechStreamingServiceEvent.SPEAKING_END);
          this.spokenText = '';
        }
      },
    });
  };

  private addEventListener(event: string, callback: (...args: Array<any>) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)?.push(callback);

    return () => {
      const callbacks = this.listeners.get(event);

      if (callbacks) {
        this.listeners.set(
          event,
          callbacks.filter((func) => func !== callback),
        );
      }
    };
  }

  private emit(event: string, ...args: Array<any>): void {
    const callbacks = this.listeners.get(event);

    if (callbacks) {
      callbacks.forEach((callback) => callback(...args));
    }
  }
}

export const speechStreamingService = new SpeechStreamingService();
