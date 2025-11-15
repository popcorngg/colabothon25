import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, Outlet, useLocation } from "react-router-dom";

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
  
  /*
   useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("✅ User logged in:", user.email);
        localStorage.setItem('userToken', user.uid);
        localStorage.setItem('userEmail', user.email);
        
        if (location.pathname === '/login') {
          navigate('/');
        }
      } else {
        console.log("❌ No user");
        localStorage.removeItem('userToken');
        localStorage.removeItem('userEmail');
      }
    });

    return () => unsubscribe();
  }, [navigate, location]);
 
  */

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

            // ─────────────────────── KEYWORD: JARVIS ───────────────────────
            if (cmd.includes("jarvis")) {
              console.log("🟦 Keyword detected: JARVIS:", cmd);

              // всё после "jarvis"
              const cleaned = cmd.split("jarvis")[1]?.trim() || "";

              console.log("🟦 Command after keyword:", cleaned);

              if (cleaned.length > 0) {
                try {
                  console.log("🟦 Sending to neural API:", cleaned);

                  fetch("http://localhost:5000/api/neural-action", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ input: cleaned })
                  })
                    .then(res => res.json())
                    .then(data => {
                      console.log("🟦 Neural response:", data);
                      // Озвучиваем ответ AI на его языке
                      if (data.result) {
                        speak(data.result);
                      }
                    })
                    .catch(err => console.error("🟥 Neural API error:", err));
                } catch (error) {
                  console.error("🟥 Fetch exception:", error);
                }
              }

              return; // чтобы не переключало страницы
            }

            // ─────────────────────── НАВИГАЦИЯ ───────────────────────
            if (cmd.includes("dashboard") || cmd.includes("back") || cmd.includes("main page")) {
              navigate("/");
            } else if (cmd.includes("transactions")) {
              navigate("/trans");
            } else if (cmd.includes("currency")) {
              navigate("/currency");
            } else if (cmd.includes("bleak") || cmd.includes("blik")) {
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
      <FloatingChat />

      <Routes>
        {/* public */}
        <Route path="/login" element={<Login />} />

        {/* protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/blik" element={<Blik />} />
          <Route path="/trans" element={<Trans />} />
          <Route path="/currency" element={<Currency />} />
          <Route path="/support" element={<Support />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppWrapper;
export { App };
