import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, Outlet, useLocation } from "react-router-dom";
import { useSpeech } from "./hooks/useSpeech";

import Dashboard from "./pages/dash/Dashboard";
import Blik from "./pages/blik/blik";
import Trans from "./pages/trans/trans";
import Currency from "./pages/currency/cur";
import Support from "./pages/support/sup";
import FloatingChat from './components/FloatingChat';
import Login from "./pages/Login/login";
import { auth } from './pages/firebase';



function ProtectedRoute() {
  const isAuthenticated = localStorage.getItem('userToken');
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [voiceStarted, setVoiceStarted] = useState(false);
  const [pendingBobbyMessage, setPendingBobbyMessage] = useState(null);
  const { speak } = useSpeech();
  const chatRef = useRef(null);

  const bufferRef = useRef("");      // Собираем partial
  const lastCommandRef = useRef(""); // Последняя отправленная команда
  const cooldownRef = useRef(0);     // Таймер антиспам
  const timeoutRef = useRef(null);   // Таймаут паузы

  const SILENCE_DELAY = 800;         // пауза между словами (ms)
  const COMMAND_COOLDOWN = 1500;     // антиспам (ms)
  const SIMILARITY_THRESHOLD = 0.8;  // порог похожести

  useEffect(() => {
    let ws = null;
    let audioContext = null;
    let processor = null;
    let micStream = null;
    let started = false;

    const startAudio = async () => {
      if (started) return;
      started = true;
      setVoiceStarted(true);
      console.log("🎤 Starting audio...");

      try {
        ws = new WebSocket("ws://localhost:4269");
        ws.binaryType = "arraybuffer";

        ws.onopen = () => console.log("🎤 WS connected");

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            const cmd = (data.final || data.partial || "").toLowerCase();
            if (!cmd) return;

            // Добавляем в буфер
            bufferRef.current = cmd;

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
              const finalCmd = bufferRef.current.trim();
              const now = Date.now();

              if (!finalCmd) return;

              // Проверка похожести
              if (stringSimilarity(finalCmd, lastCommandRef.current) > SIMILARITY_THRESHOLD &&
                now - cooldownRef.current < COMMAND_COOLDOWN) {
                bufferRef.current = "";
                return;
              }

              lastCommandRef.current = finalCmd;
              cooldownRef.current = now;
              bufferRef.current = "";

              handleCommand(finalCmd);

            }, SILENCE_DELAY);

          } catch (err) {
            console.error("JSON parse error:", err);
          }
        };

        ws.onerror = (err) => console.error("🎤 WS error:", err);
        ws.onclose = () => console.log("🎤 WS closed");

        // ─────────────────────── AUDIO ───────────────────────
        audioContext = new AudioContext({ sampleRate: 16000 });
        await audioContext.resume();

        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(micStream);

        processor = audioContext.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (!ws || ws.readyState !== WebSocket.OPEN) return;

          const float32 = e.inputBuffer.getChannelData(0);
          const sum = float32.reduce((acc, v) => acc + Math.abs(v), 0);
          if (sum === 0) return;

          const pcm16 = new Int16Array(float32.length);
          for (let i = 0; i < float32.length; i++) {
            let s = Math.max(-1, Math.min(1, float32[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
          }

          ws.send(new Uint8Array(pcm16.buffer));
        };

        source.connect(processor);
        processor.connect(audioContext.destination);

        console.log("🎤 Audio pipeline ready");

      } catch (err) {
        console.error("🎤 Audio setup error:", err);
      }
    };

    const clickHandler = () => startAudio();
    document.body.addEventListener("click", clickHandler, { once: true });

    return () => {
      console.log("🎤 Cleanup voice...");
      document.body.removeEventListener("click", clickHandler);

      if (ws) ws.close();
      if (processor) processor.disconnect();
      if (audioContext) audioContext.close();
      if (micStream) micStream.getTracks().forEach(t => t.stop());
    };
  }, []);

  // ────────────── Отправка команд ──────────────
  const handleCommand = (cmd) => {
    console.log("🟦 Command ready:", cmd);

    if (cmd.includes("bobby")) {
      const cleaned = cmd.split("bobby")[1]?.trim() || "";
      if (cleaned) {
        setPendingBobbyMessage(cleaned);
      }
      return;
    }

    if (cmd.includes("dashboard") || cmd.includes("back") || cmd.includes("main page")) navigate("/");
    else if (cmd.includes("transactions")) navigate("/trans");
    else if (cmd.includes("currency")) navigate("/currency");
    else if (cmd.includes("bleak") || cmd.includes("blik")) navigate("/blik");
    else if (cmd.includes("support")) navigate("/support");
  };

  // ────────────── Проверка похожести строк ──────────────
  const stringSimilarity = (a, b) => {
    if (!a || !b) return 0;
    let longer = a.length > b.length ? a : b;
    let shorter = a.length > b.length ? b : a;
    let same = 0;
    for (let i = 0; i < shorter.length; i++) {
      if (shorter[i] === longer[i]) same++;
    }
    return same / longer.length;
  };

  return (
    <div className="App">
      <FloatingChat 
        ref={chatRef}
        pendingBobbyMessage={pendingBobbyMessage}
      />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/blik" element={<Blik />} />
        <Route path="/trans" element={<Trans />} />
        <Route path="/currency" element={<Currency />} />
        <Route path="/support" element={<Support />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
}

export default AppWrapper;
export { App };