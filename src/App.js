import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Assistant from "./components/Assistant";

function App() {
  const [showAssistant, setShowAssistant] = useState(false);

  return (
    <div className="App">
      <Dashboard onOpenAssistant={() => setShowAssistant(true)} />

      {showAssistant && (
        <Assistant onClose={() => setShowAssistant(false)} />
      )}
    </div>
  );
}

export default App;
