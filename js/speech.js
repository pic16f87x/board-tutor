/**
 * Web Speech API wrapper for AI Tutor TTS (speechSynthesis) and Student STT (SpeechRecognition).
 */
class SpeechManager {
  constructor() {
    this.enabled = true;
    this.rate = 1.0;
    this.lang = 'zh-TW';
    this.recognition = null;
    this.isListening = false;
    this.currentUtterance = null;
    this.voices = [];
    this.onSpeakStateChange = null;

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        this.voices = window.speechSynthesis.getVoices() || [];
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  getLocaleCode(lang) {
    switch (lang) {
      case 'zh-CN': return 'zh-CN';
      case 'en': return 'en-US';
      case 'ja': return 'ja-JP';
      default: return 'zh-TW';
    }
  }

  pickVoice(locale) {
    if (!this.voices.length) return null;
    const exact = this.voices.find((v) => v.lang.toLowerCase() === locale.toLowerCase());
    if (exact) return exact;
    const prefix = locale.split('-')[0].toLowerCase();
    return this.voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) || null;
  }

  setLang(lang) {
    this.lang = lang;
  }

  setRate(rate) {
    this.rate = Number(rate) || 1.0;
  }

  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    if (!this.enabled) {
      this.stopSpeaking();
    }
  }

  speak(text, { onEnd, onStart } = {}) {
    this.stopSpeaking();
    if (!text) {
      if (onEnd) onEnd();
      return;
    }

    if (!this.enabled || !('speechSynthesis' in window)) {
      if (onStart) onStart();
      if (this.onSpeakStateChange) this.onSpeakStateChange(true);
      const fallbackMs = Math.min(6000, Math.max(1600, text.length * 85 / this.rate));
      this._fallbackTimer = setTimeout(() => {
        if (this.onSpeakStateChange) this.onSpeakStateChange(false);
        if (onEnd) onEnd();
      }, fallbackMs);
      return;
    }

    const cleaned = text.replace(/[*`#]/g, '').trim();
    const utter = new SpeechSynthesisUtterance(cleaned);
    const locale = this.getLocaleCode(this.lang);
    utter.lang = locale;
    utter.rate = this.rate;
    const voice = this.pickVoice(locale);
    if (voice) utter.voice = voice;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(this._safetyTimer);
      this.currentUtterance = null;
      if (this.onSpeakStateChange) this.onSpeakStateChange(false);
      if (onEnd) onEnd();
    };

    utter.onstart = () => {
      if (this.onSpeakStateChange) this.onSpeakStateChange(true);
      if (onStart) onStart();
    };
    utter.onend = finish;
    utter.onerror = finish;

    // Safety timeout in case browser speechSynthesis stalls silently
    const maxWait = Math.max(4500, (cleaned.length * 190) / this.rate + 2500);
    this._safetyTimer = setTimeout(finish, maxWait);

    this.currentUtterance = utter;
    try {
      window.speechSynthesis.speak(utter);
    } catch (_) {
      finish();
    }
  }

  stopSpeaking() {
    clearTimeout(this._fallbackTimer);
    clearTimeout(this._safetyTimer);
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (_) {}
    }
    this.currentUtterance = null;
    if (this.onSpeakStateChange) this.onSpeakStateChange(false);
  }

  isRecognitionSupported() {
    return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  toggleListening({ onResult, onError, onStateChange }) {
    if (this.isListening && this.recognition) {
      this.recognition.stop();
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      if (onError) onError('此瀏覽器不支援語音輸入，請改用文字輸入或使用 Chrome / Edge。');
      return;
    }

    const rec = new SpeechRec();
    rec.lang = this.getLocaleCode(this.lang);
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    this.recognition = rec;
    this.isListening = true;
    if (onStateChange) onStateChange(true);

    let finalTranscript = '';
    rec.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += chunk;
        } else {
          interim += chunk;
        }
      }
      if (onResult) onResult((finalTranscript || interim).trim(), Boolean(finalTranscript));
    };

    rec.onerror = (ev) => {
      this.isListening = false;
      if (onStateChange) onStateChange(false);
      if (ev.error !== 'aborted' && onError) {
        onError('語音辨識未成功（' + ev.error + '），請檢查麥克風權限。');
      }
    };

    rec.onend = () => {
      this.isListening = false;
      if (onStateChange) onStateChange(false);
    };

    try {
      rec.start();
    } catch (err) {
      this.isListening = false;
      if (onStateChange) onStateChange(false);
      if (onError) onError('無法啟動麥克風。');
    }
  }
}

window.SpeechManager = SpeechManager;
