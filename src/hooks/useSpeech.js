import { useCallback, useState } from 'react';

export const useSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Функция для определения языка текста
  const detectLanguage = useCallback((text) => {
    if (!text) return 'en-US';
    
    // Кириллица (русский, украинский, сербский)
    if (/[а-яёА-ЯЁ]/.test(text)) return 'ru-RU';
    
    // Латиница с диакритикой (польский, украинский латиница)
    if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(text)) return 'pl-PL';
    
    // Греческий
    if (/[α-ωΑ-Ω]/.test(text)) return 'el-GR';
    
    // Арабский
    if (/[ء-ي]/.test(text)) return 'ar-SA';
    
    // Китайский
    if (/[\u4E00-\u9FFF]/.test(text)) return 'zh-CN';
    
    // Японский
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja-JP';
    
    // Корейский
    if (/[\uAC00-\uD7AF]/.test(text)) return 'ko-KR';
    
    // По умолчанию английский
    return 'en-US';
  }, []);

  // Функция озвучки текста на автоматически определяемом языке
  const speak = useCallback((text) => {
    if (!text || !window.speechSynthesis) {
      console.warn('Озвучка недоступна');
      return;
    }

    // Остановить текущее озвучивание
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

  // Функция для остановки озвучки
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
