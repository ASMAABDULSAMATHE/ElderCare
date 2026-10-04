/**
 * Gemini Live Client Service for ElderCare
 * Handles bidirectional audio streaming, 16kHz PCM capture, 24kHz PCM playback,
 * interruption handling (barge-in), tool call round-trips, and robust error recovery.
 */

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>;
}

export interface LiveClientCallbacks {
  onConnected?: (model: string) => void;
  onAssistantSpeechStart?: () => void;
  onAssistantSpeechEnd?: () => void;
  onUserTranscription?: (text: string) => void;
  onAssistantTranscription?: (text: string, isFinal?: boolean) => void;
  onInterrupted?: () => void;
  onToolCall?: (calls: ToolCall[], respond: (responses: Array<{ id: string; response: Record<string, any> }>) => void) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private micStream: MediaStream | null = null;
  private captureCtx: AudioContext | null = null;
  private playbackCtx: AudioContext | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private nextStartTime = 0;
  private callbacks: LiveClientCallbacks = {};
  private isMuted = false;
  private isConnecting = false;
  private isConnected = false;
  public hasMicPermission = false;

  public isSessionActive(): boolean {
    return this.isConnected;
  }

  constructor(callbacks: LiveClientCallbacks) {
    this.callbacks = callbacks;
  }

  public async connect(role = 'elderly', userData: any = {}, requireMic = true): Promise<boolean> {
    if (this.isConnecting || this.isConnected) return true;
    this.isConnecting = true;

    // 1. Attempt microphone permission first if required
    if (requireMic) {
      const micSuccess = await this.startMicrophoneCapture();
      if (!micSuccess) {
        this.isConnecting = false;
        // Callback already dispatched in startMicrophoneCapture
        return false;
      }
    }

    try {
      // 2. Establish WebSocket connection to backend /live
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.isConnecting = false;
        this.isConnected = true;
        // Send initial context to Gemini Live
        this.ws?.send(
          JSON.stringify({
            type: 'init',
            role,
            userData,
          })
        );
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleServerMessage(msg);
        } catch (e) {
          console.warn('Error parsing live server message:', e);
        }
      };

      this.ws.onerror = (e) => {
        console.warn('Live WebSocket warning:', e);
        this.callbacks.onError?.("I couldn't connect right now. Please try again.");
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.isConnecting = false;
        this.stopAudioPlayback();
        this.callbacks.onClose?.();
      };

      return true;
    } catch (err: any) {
      this.isConnecting = false;
      this.isConnected = false;
      this.disconnect();
      this.callbacks.onError?.("I couldn't connect right now. Please try again.");
      return false;
    }
  }

  private handleServerMessage(msg: any) {
    switch (msg.type) {
      case 'ready':
      case 'connected':
        this.callbacks.onConnected?.(msg.model || 'gemini-3.8-live');
        break;

      case 'audio':
        if (msg.data) {
          this.callbacks.onAssistantSpeechStart?.();
          this.playAudioChunk(msg.data);
        }
        break;

      case 'assistant_text':
        if (msg.text) {
          this.callbacks.onAssistantTranscription?.(msg.text, false);
        }
        break;

      case 'turn_complete':
        this.callbacks.onAssistantSpeechEnd?.();
        break;

      case 'interrupted':
        this.stopAudioPlayback();
        this.callbacks.onInterrupted?.();
        break;

      case 'tool_call':
        if (msg.functionCalls && msg.functionCalls.length > 0) {
          this.callbacks.onToolCall?.(msg.functionCalls, (responses) => {
            this.sendToolResponse(responses);
          });
        }
        break;

      case 'error':
        this.callbacks.onError?.(msg.error || 'Gemini service encountered an issue.');
        break;

      case 'session_close':
        this.callbacks.onClose?.();
        break;
    }
  }

  private async startMicrophoneCapture(): Promise<boolean> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        this.callbacks.onError?.('Microphone is not supported in this browser environment.');
        return false;
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.hasMicPermission = true;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.captureCtx = new AudioContextClass();

      const source = this.captureCtx.createMediaStreamSource(this.micStream);
      // 4096 buffer size
      this.processorNode = this.captureCtx.createScriptProcessor(4096, 1, 1);

      this.processorNode.onaudioprocess = (e) => {
        if (this.isMuted || !this.isConnected || this.ws?.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);
        const inputSampleRate = this.captureCtx?.sampleRate || 44100;
        // Downsample to 16kHz PCM little-endian and convert to base64
        const pcm16kBase64 = this.downsampleAndConvertToPCM(inputData, inputSampleRate, 16000);

        if (pcm16kBase64 && this.ws?.readyState === WebSocket.OPEN) {
          try {
            this.ws.send(
              JSON.stringify({
                type: 'audio',
                data: pcm16kBase64,
              })
            );
          } catch (err) {
            console.warn('Failed to send audio packet:', err);
          }
        }
      };

      source.connect(this.processorNode);
      this.processorNode.connect(this.captureCtx.destination);
      return true;
    } catch (err: any) {
      console.warn('Microphone permission or capture issue:', err?.message || err);
      this.hasMicPermission = false;
      if (
        err?.name === 'NotAllowedError' ||
        err?.name === 'PermissionDeniedError' ||
        String(err?.message || '').toLowerCase().includes('permission denied')
      ) {
        this.callbacks.onError?.('Microphone access was denied. Please allow microphone permissions in your browser.');
      } else {
        this.callbacks.onError?.('Microphone initialization failed. Please check your audio settings.');
      }
      return false;
    }
  }

  /**
   * Resamples raw audio Float32 buffer to 16kHz 16-bit signed PCM little-endian,
   * then encodes as base64 string for Gemini Live API input.
   */
  private downsampleAndConvertToPCM(
    inputData: Float32Array,
    inputSampleRate: number,
    outputSampleRate = 16000
  ): string {
    if (inputData.length === 0) return '';

    const ratio = inputSampleRate / outputSampleRate;
    const newLength = Math.round(inputData.length / ratio);
    const result = new Int16Array(newLength);

    let offsetResult = 0;
    let offsetInput = 0;

    while (offsetResult < result.length) {
      const nextOffsetInput = Math.round((offsetResult + 1) * ratio);
      let accum = 0;
      let count = 0;
      for (let i = offsetInput; i < nextOffsetInput && i < inputData.length; i++) {
        accum += inputData[i];
        count++;
      }
      const sample = count > 0 ? accum / count : 0;
      const clamped = Math.max(-1, Math.min(1, sample));
      result[offsetResult] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      offsetResult++;
      offsetInput = nextOffsetInput;
    }

    const bytes = new Uint8Array(result.buffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Plays 24kHz raw PCM little-endian audio chunk received from Gemini Live
   * using precision scheduling for gapless playback.
   */
  private playAudioChunk(base64Data: string) {
    try {
      if (!this.playbackCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.playbackCtx = new AudioContextClass({ sampleRate: 24000 });
      }

      if (this.playbackCtx.state === 'suspended') {
        this.playbackCtx.resume().catch(() => {});
      }

      // Convert base64 16-bit PCM (24kHz) to Float32
      const binary = atob(base64Data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const int16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }

      const buffer = this.playbackCtx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);

      const source = this.playbackCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.playbackCtx.destination);

      const now = this.playbackCtx.currentTime;
      const startTime = Math.max(now, this.nextStartTime);
      source.start(startTime);
      this.nextStartTime = startTime + buffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
      };
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  /**
   * Stops active audio playback instantly when user interrupts (barge-in)
   */
  public stopAudioPlayback() {
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch (e) {}
    }
    this.activeSources = [];
    this.nextStartTime = 0;
  }

  public sendUserText(text: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            type: 'user_text',
            text,
          })
        );
      } catch (e) {
        console.warn('sendUserText failed:', e);
      }
    }
  }

  public sendToolResponse(functionResponses: Array<{ id: string; response: Record<string, any> }>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            type: 'tool_response',
            functionResponses,
          })
        );
      } catch (e) {
        console.warn('sendToolResponse failed:', e);
      }
    }
  }

  public disconnect() {
    this.stopAudioPlayback();

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch (e) {}
      this.processorNode = null;
    }

    if (this.captureCtx) {
      try {
        this.captureCtx.close();
      } catch (e) {}
      this.captureCtx = null;
    }

    if (this.playbackCtx) {
      try {
        this.playbackCtx.close();
      } catch (e) {}
      this.playbackCtx = null;
    }

    if (this.micStream) {
      try {
        this.micStream.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      this.micStream = null;
    }

    if (this.ws) {
      try {
        this.ws.close();
      } catch (e) {}
      this.ws = null;
    }

    this.isConnected = false;
    this.isConnecting = false;
  }
}
