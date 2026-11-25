/**
 * Web Speech API wrapper for AI Tutor TTS (speechSynthesis) and Student STT (SpeechRecognition).
 * Includes iOS Safari / Android Chrome gesture unlock and cancel-then-speak race protection.
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
    this.unlocked = false;
    this._speakSeq = 0;
    this.onSpeakStateChange = null;
    this.onBlockedAutoplay = null;

    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        this.voices = window.speechSynthesis.getVoices() || [];
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  /**
   * Must be called inside a user gesture (touchstart / pointerdown / click)
   * so iOS Safari and mobile Chrome permit subsequent async/auto-advance TTS.
   */
  unlock() {
    if (this.unlocked || !('speechSynthesis' in window)) return;
    this.unlocked = true;
    try {
      window.speechSynthesis.resume();
      if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
        const silent = new SpeechSynthesisUtterance(' ');
        silent.volume = 0;
        silent.rate = 10;
        window.speechSynthesis.speak(silent);
      }
    } catch (_) {}
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
    if (!this.voices.length) {
      this.voices = window.speechSynthesis?.getVoices?.() || [];
    }
    if (!this.voices.length) return null;

    const norm = (s) => String(s || '').replace(/_/g, '-').toLowerCase();
    const target = norm(locale);

    const exact = this.voices.find((v) => norm(v.lang) === target);
    if (exact) return exact;

    if (target === 'zh-tw') {
      const twAlias = this.voices.find((v) => {
        const l = norm(v.lang);
        const n = (v.name || '').toLowerCase();
        return l.includes('tw') || l.includes('hant') || n.includes('taiwan') || n.includes('mei-jia');
      });
      if (twAlias) return twAlias;
    }

    const prefix = target.split('-')[0];
    return this.voices.find((v) => norm(v.lang).startsWith(prefix)) || null;
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
    const seq = ++this._speakSeq;
    const hadActiveSpeech = Boolean(
      this.currentUtterance &&
      'speechSynthesis' in window &&
      (window.speechSynthesis.speaking || window.speechSynthesis.pending)
    );
    if (hadActiveSpeech) {
      this.stopSpeaking();
    } else {
      clearTimeout(this._fallbackTimer);
      clearTimeout(this._safetyTimer);
      clearTimeout(this._startCheckTimer);
      clearTimeout(this._queueTimer);
    }

    if (!text) {
      if (onEnd) onEnd();
      return;
    }

    if (!this.enabled || !('speechSynthesis' in window)) {
      if (onStart) onStart();
      if (this.onSpeakStateChange) this.onSpeakStateChange(true);
      const fallbackMs = Math.min(6000, Math.max(1600, text.length * 85 / this.rate));
      this._fallbackTimer = setTimeout(() => {
        if (seq !== this._speakSeq) return;
        if (this.onSpeakStateChange) this.onSpeakStateChange(false);
        if (onEnd) onEnd();
      }, fallbackMs);
      return;
    }

    const startUtterance = () => {
      if (seq !== this._speakSeq) return;
      const cleaned = text.replace(/[*`#]/g, '').trim();
      const utter = new SpeechSynthesisUtterance(cleaned);
      const locale = this.getLocaleCode(this.lang);
      utter.lang = locale;
      utter.rate = this.rate;
      utter.volume = 1;
      const voice = this.pickVoice(locale);
      if (voice) utter.voice = voice;

      let finished = false;
      let started = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(this._safetyTimer);
        clearTimeout(this._startCheckTimer);
        this.currentUtterance = null;
        window.__ahaboardUtter = null;
        if (this.onSpeakStateChange) this.onSpeakStateChange(false);
        if (onEnd) onEnd();
      };

      utter.onstart = () => {
        started = true;
        clearTimeout(this._startCheckTimer);
        if (this.onSpeakStateChange) this.onSpeakStateChange(true);
        if (onStart) onStart();
      };
      utter.onend = finish;
      utter.onerror = finish;

      // Safety timeout in case browser speechSynthesis stalls silently
      const maxWait = Math.max(4500, (cleaned.length * 190) / this.rate + 2500);
      this._safetyTimer = setTimeout(finish, maxWait);

      // Detect mobile autoplay block if speech never starts within 1.4s
      this._startCheckTimer = setTimeout(() => {
        if (!started && !finished && this.onBlockedAutoplay) {
          this.onBlockedAutoplay();
        }
      }, 1400);

      // Keep strong reference on window to prevent iOS Safari GC collecting utter mid-speech
      this.currentUtterance = utter;
      window.__ahaboardUtter = utter;

      try {
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utter);
      } catch (_) {
        finish();
      }
    };

    // Delay briefly after cancel() so iOS Safari / Android WebView doesn't drop the new utterance
    if (hadActiveSpeech) {
      this._queueTimer = setTimeout(startUtterance, 80);
    } else {
      startUtterance();
    }
  }

  stopSpeaking({ skipCancelIfIdle = false } = {}) {
    clearTimeout(this._fallbackTimer);
    clearTimeout(this._safetyTimer);
    clearTimeout(this._startCheckTimer);
    clearTimeout(this._queueTimer);
    if ('speechSynthesis' in window) {
      if (!skipCancelIfIdle || window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        try {
          window.speechSynthesis.cancel();
        } catch (_) {}
      }
    }
    this.currentUtterance = null;
    window.__ahaboardUtter = null;
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
      if (onError) onError('此瀏覽器不支援語音輸入，請改用文字輸入或使用 Android Chrome。');
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
