import { useCallback, useState } from 'react';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const detectLanguage = useCallback((text) => {
    if (!text) return 'en-US';
    
    if (/[а-яёА-ЯЁ]/.test(text)) return 'ru-RU';
    
    if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(text)) return 'pl-PL';
    
    return 'en-US';
  }, []);

  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) {
      console.warn('Озвучка недоступна');
      return;
    }

    window.speechSynthesis.cancel();
    
    const lang = detectLanguage(text);
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('Ошибка озвучки:', event.error);
      setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  }, [detectLanguage]);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    detectLanguage
  };
};
