import { useRef, useEffect } from "react";

export default function useVoiceCommand(onCommand, options = {}) {
  const lastCommandRef = useRef("");
  const commandCooldownRef = useRef(0);
  const bufferRef = useRef("");
  const timeoutRef = useRef(null);

  const SILENCE_DELAY = options.silenceDelay || 800; // ms пауза между словами
  const COMMAND_COOLDOWN = options.commandCooldown || 1500; // ms антиспам

  // Объединяем partial и final, ждем паузы
  const pushText = (text) => {
    text = text.toLowerCase().trim();
    if (!text) return;

    bufferRef.current = text;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const cmd = bufferRef.current;
      const now = Date.now();

      // Проверка похожести
      if (stringSimilarity(cmd, lastCommandRef.current) > 0.8 && now - commandCooldownRef.current < COMMAND_COOLDOWN) {
        bufferRef.current = "";
        return;
      }

      lastCommandRef.current = cmd;
      commandCooldownRef.current = now;
      bufferRef.current = "";

      onCommand(cmd);
    }, SILENCE_DELAY);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ────────────── Схожесть строк ──────────────
  function stringSimilarity(a, b) {
    if (!a || !b) return 0;
    let longer = a.length > b.length ? a : b;
    let shorter = a.length > b.length ? b : a;
    let same = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (shorter[i] === longer[i]) same++;
    }
    return same / longer.length;
  }

  return { pushText };
}
