import { setAudioModeAsync } from 'expo-audio';
import * as Speech from 'expo-speech';
import { SpeechStreamingServiceEvent } from './enums';
import { prepareSpeakableText } from './prepare-speakable-text';

const textBreakpoints = ['.', '!', '?', ',', ';', ':', '-'];

type SpeechQueueItem = {
  text: string;
  isFinal: boolean;
};

class SpeechStreamingService {
  private spokenText: string;
  private isStopped: boolean;
  private speechGeneration: number;
  private queue: Array<SpeechQueueItem>;
  private isProcessingQueue: boolean;
  private listeners: Map<string, Array<(...args: Array<any>) => void>> = new Map();

  constructor() {
    this.spokenText = '';
    this.isStopped = true;
    this.speechGeneration = 0;
    this.queue = [];
    this.isProcessingQueue = false;
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
    this.queue = [];
  };

  public stopContentSpeaking = async (): Promise<void> => {
    // NOTE: Bump generation before await so in-flight onDone / queue work becomes stale
    this.speechGeneration += 1;
    this.isStopped = true;
    this.spokenText = '';
    this.queue = [];
    await Speech.stop();
    this.isProcessingQueue = false;
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
      this.enqueue({ text: textToSpeak, isFinal: !!isDone });

      return;
    }

    if (isDone) {
      // NOTE: All speakable text was already queued; emit end after the speech queue drains
      this.enqueue({ text: '', isFinal: true });
    }
  }

  public clearListeners(): void {
    this.listeners.clear();
  }

  private enqueue(item: SpeechQueueItem): void {
    if (this.isStopped) {
      return;
    }

    this.queue.push(item);
    void this.processQueue();
  }

  private processQueue = async (): Promise<void> => {
    if (this.isProcessingQueue) {
      return;
    }

    this.isProcessingQueue = true;
    const generation = this.speechGeneration;

    try {
      while (this.queue.length > 0) {
        if (this.isStopped || generation !== this.speechGeneration) {
          break;
        }

        const item = this.queue.shift();

        if (!item) {
          break;
        }

        if (item.text.trim()) {
          await this.speakSegment(item.text, generation);
        }

        if (this.isStopped || generation !== this.speechGeneration) {
          break;
        }

        if (item.isFinal) {
          this.emit(SpeechStreamingServiceEvent.SPEAKING_END);
          this.spokenText = '';
        }
      }
    } finally {
      if (generation === this.speechGeneration) {
        this.isProcessingQueue = false;
      }
    }
  };

  private speakSegment = async (text: string, generation: number): Promise<void> => {
    if (this.isStopped || generation !== this.speechGeneration) {
      return;
    }

    // NOTE: Need to set audio mode to allow speech in silent mode on iOS
    await setAudioModeAsync({
      playsInSilentMode: true,
    });

    if (this.isStopped || generation !== this.speechGeneration) {
      return;
    }

    await new Promise<void>((resolve) => {
      if (this.isStopped || generation !== this.speechGeneration) {
        resolve();

        return;
      }

      Speech.speak(text, {
        // NOTE: Only English is working good for now
        language: 'en-US',
        onDone: () => resolve(),
        onStopped: () => resolve(),
        onError: () => resolve(),
      });
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
