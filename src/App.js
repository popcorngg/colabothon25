import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";

import Dashboard from "./pages/dash/Dashboard";
import Blik from "./pages/blik/blik";
import Trans from "./pages/trans/trans";
import Currency from "./pages/currency/cur";
import Support from "./pages/support/sup";

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const navigate = useNavigate();
  const [voiceStarted, setVoiceStarted] = useState(false);

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
        // ─────────────────────── WS ───────────────────────
        ws = new WebSocket("ws://localhost:4269");
        ws.binaryType = "arraybuffer";

        ws.onopen = () => console.log("🎤 WS connected");

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            const cmd = (data.final || data.partial || "").toLowerCase();
            if (!cmd) return;

            console.log("🎤 Recognized:", cmd);

            if (cmd.includes("jarvis")) {
              console.log("🟦 Keyword detected: JARVIS");
            } else if (cmd.includes("dashboard") || cmd.includes("back") || cmd.includes("main page")) {
              navigate("/");
            } else if (cmd.includes("transactions")) {
              navigate("/trans");
            } else if (cmd.includes("currency")) {
              navigate("/currency");
            } else if (cmd.includes("bleak")) {
              navigate("/blik");
            } else if (cmd.includes("support")) {
              navigate("/support");
            }

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
      if (micStream) micStream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/blik" element={<Blik />} />
        <Route path="/trans" element={<Trans />} />
        <Route path="/currency" element={<Currency />} />
        <Route path="/support" element={<Support />} />
      </Routes>
    </div>
  );
}

export default AppWrapper;
