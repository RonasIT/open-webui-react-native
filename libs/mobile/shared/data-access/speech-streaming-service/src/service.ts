import { setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { SpeechStreamingServiceEvent } from './enums';
import { prepareSpeakableText } from './prepare-speakable-text';

const textBreakpoints = ['.', '!', '?', ',', ';', ':', '-'];

class SpeechStreamingService {
  private spokenText: string;
  private isStopped: boolean;
  private listeners: Map<string, Array<(...args: Array<any>) => void>> = new Map();

  constructor() {
    this.spokenText = '';
    this.isStopped = true;
  }

  public onSpeakingStart(callback: () => void): () => void {
    return this.addEventListener(SpeechStreamingServiceEvent.SPEAKING_START, callback);
  }

  public onSpeakingEnd(callback: () => void): () => void {
    return this.addEventListener(SpeechStreamingServiceEvent.SPEAKING_END, callback);
  }

  public resumeContentSpeaking = (): void => {
    this.isStopped = false;
    this.spokenText = '';
  };

  public stopContentSpeaking = async (): Promise<void> => {
    // NOTE: Set before await so in-flight speakText calls bail out after setAudioModeAsync
    this.isStopped = true;
    this.spokenText = '';
    await Speech.stop();
  };

  public handleContent(text: string, isDone?: boolean): void {
    if (this.isStopped) {
      return;
    }

    // NOTE: Speak cleaned markdown; cursor tracks speakable length
    const speakableText = prepareSpeakableText(text, { holdIncomplete: !isDone });
    const unspokenText = speakableText.slice(this.spokenText.length);

    let textToSpeak = '';

    if (isDone) {
      // NOTE: Flush all leftover speakable text when the message is complete
      textToSpeak = unspokenText;
    } else {
      // NOTE: Separate text by breakpoints to make streaming speech more natural
      for (let i = unspokenText.length - 1; i >= 0; i--) {
        if (textBreakpoints.includes(unspokenText[i])) {
          textToSpeak = unspokenText.slice(0, i + 1);
          break;
        }
      }
    }

    if (textToSpeak.trim()) {
      if (this.spokenText.length === 0) {
        this.emit(SpeechStreamingServiceEvent.SPEAKING_START);
      }

      this.spokenText = this.spokenText + textToSpeak;

      this.speakText(textToSpeak, isDone);

      return;
    }

    if (isDone) {
      // NOTE: All speakable text was already queued; emit end after the speech queue drains
      this.speakText('', true);
    }
  }

  public clearListeners(): void {
    this.listeners.clear();
  }

  private speakText = async (text: string, isDone?: boolean): Promise<void> => {
    if (this.isStopped) {
      return;
    }

    // NOTE: Need to set audio mode to allow speech in silent mode on iOS
    await setAudioModeAsync({
      playsInSilentMode: true,
    });

    // NOTE: stopContentSpeaking may have been called while awaiting audio mode
    if (this.isStopped) {
      return;
    }

    Speech.speak(text, {
      // NOTE: Only English is working good for now
      language: 'en-US',
      onDone: () => {
        if (this.isStopped) {
          return;
        }

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
