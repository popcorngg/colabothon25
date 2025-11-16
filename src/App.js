import { useEffect, useState, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, Outlet, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { useSpeech } from "./hooks/useSpeech";

import Dashboard from "./pages/dash/Dashboard";
import Blik from "./pages/blik/blik";
import Trans from "./pages/trans/trans";
import Currency from "./pages/currency/cur";
import Support from "./pages/support/sup";
import FloatingChat from './components/FloatingChat';
import { auth } from './firebase';
import Analitics from "./pages/analitics/anal";
import Contacts from "./pages/contacts/cont";
import SignIn from "./pages/auth/SignIn.jsx";
import SignUp from "./pages/auth/SignUp.jsx";
import AuthDetails from "./pages/auth/AuthDetails.jsx";
import "./pages/auth/AuthDetails.css";

function ProtectedRoute() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #000000 0%, #cfcf04 30%, #a98801 60%, #ffff00 100%)',
        color: '#FFD700',
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Loading...
      </div>
    );
  }

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
  const [chatCommand, setChatCommand] = useState(null);
  const [flipCard, setFlipCard] = useState(false);
  const { speak } = useSpeech();
  const chatRef = useRef(null);

  const bufferRef = useRef("");
  const lastCommandRef = useRef("");
  const cooldownRef = useRef(0);
  const timeoutRef = useRef(null);

  const SILENCE_DELAY = 800;
  const COMMAND_COOLDOWN = 1500;
  const SIMILARITY_THRESHOLD = 0.8;

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

        ws.onopen = () => console.log("🎤 WebSocket connected");

        ws.onmessage = (ev) => {
          try {
            const data = JSON.parse(ev.data);
            const cmd = (data.final || data.partial || "").toLowerCase();
            if (!cmd) return;

            bufferRef.current = cmd;

            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(() => {
              const finalCmd = bufferRef.current.trim();
              const now = Date.now();

              if (!finalCmd) return;

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

        ws.onerror = (err) => console.error("🎤 WebSocket error:", err);
        ws.onclose = () => console.log("🎤 WebSocket closed");

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
        console.error("🎤 Audio initialization error:", err);
      }
    };

    const clickHandler = () => startAudio();
    document.body.addEventListener("click", clickHandler, { once: true });

    return () => {
      console.log("🎤 Cleaning up voice...");
      document.body.removeEventListener("click", clickHandler);

      if (ws) ws.close();
      if (processor) processor.disconnect();
      if (audioContext) audioContext.close();
      if (micStream) micStream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCommand = (cmd) => {
    console.log("🟦 Command detected:", cmd);

    if (cmd.includes("bobby")) {
      const cleaned = cmd.split("bobby")[1]?.trim() || "";
      if (cleaned) {
        setPendingBobbyMessage(cleaned);
      }
      return;
    }

    if (cmd === "open") {
      setChatCommand("open");
      return;
    }

    if (cmd === "close") {
      setChatCommand("close");
      return;
    }

    if (cmd.includes("flip")) {
      setFlipCard(prev => !prev);
      return;
    }

    if (cmd.includes("dashboard") || cmd.includes("back") || cmd.includes("main page")) navigate("/");
    else if (cmd.includes("transactions")) navigate("/trans");
    else if (cmd.includes("currency")) navigate("/currency");
    else if (cmd.includes("bleak") || cmd.includes("blik")) navigate("/blik");
    else if (cmd.includes("support")) navigate("/support");
    else if (cmd.includes("contacts")) navigate("/contacts");
    else if (cmd.includes("analytics")) navigate("/analytics");
  };

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

  // Check if we're on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div className="App">
      {/* Show AuthDetails and FloatingChat only on protected pages */}
      {!isAuthPage && (
        <>
          <AuthDetails />
          <FloatingChat
            ref={chatRef}
            pendingBobbyMessage={pendingBobbyMessage}
            chatCommand={chatCommand}
            onChatCommand={() => setChatCommand(null)}
          />
        </>
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected routes - require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard flipCard={flipCard} onFlipCard={() => setFlipCard(prev => !prev)} />} />
          <Route path="/blik" element={<Blik />} />
          <Route path="/trans" element={<Trans />} />
          <Route path="/currency" element={<Currency />} />
          <Route path="/support" element={<Support />} />
          <Route path="/analytics" element={<Analitics />} />
          <Route path="/contacts" element={<Contacts />} />
        </Route>
      </Routes>
    </div>
  );
}

export default AppWrapper;
export { App };