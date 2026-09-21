import 'fake-indexeddb/auto';

// Ensure crypto.randomUUID is present
if (!globalThis.crypto?.randomUUID) {
  globalThis.crypto = {
    ...globalThis.crypto,
    randomUUID: () => 'test-uuid-' + Math.random().toString(36).substring(2, 9)
  };
}

// Notification mock
if (!globalThis.Notification) {
  globalThis.Notification = class {
    static permission = 'granted';
    static requestPermission = async () => 'granted';
    constructor(title, options) {
      this.title = title;
      this.options = options;
    }
  };
}

// Mock window.scrollTo
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};

  // Mock window.matchMedia
  if (!window.matchMedia) {
    window.matchMedia = (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    });
  }

  // Mock navigator.vibrate
  if (!navigator.vibrate) {
    navigator.vibrate = () => true;
  }

  // Mock Fullscreen API
  if (typeof document !== 'undefined') {
    if (!document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen = async () => {};
    }
    if (!document.exitFullscreen) {
      document.exitFullscreen = async () => {};
    }
  }
}

// Mock SpeechRecognition
if (typeof globalThis.SpeechRecognition === 'undefined') {
  globalThis.SpeechRecognition = class {
    constructor() {
      this.continuous = false;
      this.interimResults = false;
      this.lang = 'en-US';
      this.onstart = null;
      this.onresult = null;
      this.onerror = null;
      this.onend = null;
    }
    start() {}
    stop() {}
    abort() {}
  };
  globalThis.webkitSpeechRecognition = globalThis.SpeechRecognition;
}
